import type { ListeningSnapshot } from '../types'

export function streakMultiplier(days: number) {
  if (days >= 30) return 2
  if (days >= 14) return 1.5
  if (days >= 7) return 1.25
  return 1
}

export function formatMultiplier(value: number) {
  return `x${value.toLocaleString('es-ES')}`
}

export function nextStreakTier(days: number) {
  if (days < 7) return { at: 7, multiplier: 1.25 }
  if (days < 14) return { at: 14, multiplier: 1.5 }
  if (days < 30) return { at: 30, multiplier: 2 }
  return null
}

export type DayReward = {
  day: number
  label: string
  detail: string
  coins: number
  xp: number
  card: 'common' | 'epic' | 'exclusive' | null
}

export function calendarReward(day: number): DayReward {
  if (day >= 30) return { day: 30, label: 'Objeto exclusivo', detail: 'Marco Corona', coins: 0, xp: 0, card: 'exclusive' }
  if (day === 7 || day === 14 || day === 21) return { day, label: 'Carta épica', detail: 'Una rareza de la semana', coins: 0, xp: 80, card: 'epic' }
  if (day % 3 === 0) return { day, label: 'Carta', detail: 'Entra en la colección', coins: 0, xp: 20, card: 'common' }
  if (day % 2 === 0) return { day, label: 'XP', detail: 'La racha empuja el nivel', coins: 0, xp: 40 + day * 6, card: null }
  return { day, label: 'Beats', detail: 'Moneda de la liga', coins: 25 + day * 8, xp: 0, card: null }
}

export const SEASON = {
  id: 's1',
  number: 1,
  name: 'Reyes del Reggaetón',
  detail: 'Treinta días para coronar el género. Cartas de Feid, tronos temáticos y un pase de 50 niveles.',
}

export const PASS_XP = 120
export const PASS_LEVELS = 50
export const PASS_PRICE = 1200

export function passProgress(xp: number) {
  const level = Math.min(PASS_LEVELS, Math.floor(xp / PASS_XP) + 1)
  const into = level >= PASS_LEVELS ? PASS_XP : xp - (level - 1) * PASS_XP
  return { level, into, need: PASS_XP, ratio: Math.min(1, into / PASS_XP) }
}

export function passReward(level: number, track: 'free' | 'premium') {
  if (track === 'premium') {
    if (level === 50) return 'Destructor de Tronos'
    if (level % 10 === 0) return 'Carta mítica'
    if (level % 5 === 0) return 'Carta épica'
    return `${30 + level} Beats`
  }
  if (level % 10 === 0) return `${level * 12} Beats`
  return `${16 + level * 2} XP`
}

export const EVENTS = [
  { id: 'quevedo', name: 'Quevedo Week', status: 'En vivo', detail: 'Batalla, carta y trono. Solo esta semana el dominio de Quevedo paga doble en la temporada.', href: '/jugar/battle?artist=quevedo' },
  { id: 'bunny', name: 'Bad Bunny Week', status: 'Próximo', detail: 'Preguntas, carta exclusiva y un trono que se pone al rojo.', href: '/eventos' },
  { id: 'summer', name: 'Summer Hits', status: 'Próximo', detail: 'El catálogo de verano entra en duelos y en el Wrapped.', href: '/eventos' },
  { id: 'grammy', name: 'Grammy Event', status: 'Próximo', detail: 'Una noche. Recompensas limitadas. Predicciones que valen el doble.', href: '/predice' },
  { id: 'wrapped', name: 'Spotify Wrapped Event', status: 'Próximo', detail: 'Cuando cierre el año, la liga convierte tu escucha en temporada.', href: '/wrapped' },
] as const

export const THRONE_HISTORY = [
  { text: 'Sergio conquista el trono del Reggaetón.', ago: 'hace 6 días' },
  { text: 'Ángel defiende Quevedo frente a David.', ago: 'hace 2 días' },
  { text: 'Marcos toma el trono del Rock.', ago: 'hace 4 días' },
  { text: 'Lucía conserva el Pop otra semana.', ago: 'hace 9 días' },
]

export const THRONE_DAYS: Record<string, number> = {
  'artist:quevedo': 12,
  'artist:bad-bunny': 9,
  'artist:feid': 4,
  'genre:Reggaetón': 6,
  'genre:Pop': 15,
  'genre:Rock': 4,
}

export type MusicInsight = { id: string; title: string; detail: string; href: string }

export type InsightInput = {
  topArtist?: string
  topGenre?: string
  threat?: string
  friendName?: string
  compat?: number
}

export type InsightEngine = {
  id: 'heuristic' | 'model'
  recommend: (input: InsightInput) => MusicInsight[]
}

export function recommendInsights(input: InsightInput): MusicInsight[] {
  const notes: MusicInsight[] = []
  if (input.threat) {
    notes.push({ id: 'throne', title: 'Trono en juego', detail: input.threat, href: '/tronos' })
  }
  if (input.friendName && input.compat) {
    notes.push({
      id: 'duel',
      title: `Reto para ${input.friendName}`,
      detail: `Compatibilidad ${input.compat}%. Un duelo hoy aprieta la liga de amigos.`,
      href: '/amigos',
    })
  }
  if (input.topArtist) {
    notes.push({
      id: 'battle',
      title: `Batalla ${input.topArtist}`,
      detail: 'Tu artista principal concentra las preguntas. Defenderlo suma dominio.',
      href: '/juegos',
    })
  }
  if (input.topGenre) {
    notes.push({
      id: 'discover',
      title: `Tu oído vive en ${input.topGenre}`,
      detail: 'La temporada premia ese género. Una carta épica sigue suelta en las misiones.',
      href: '/temporada',
    })
  }
  return notes.slice(0, 3)
}

export const heuristicEngine: InsightEngine = {
  id: 'heuristic',
  recommend: recommendInsights,
}

export function insightInputFromSnapshot(snapshot: ListeningSnapshot, extra: Omit<InsightInput, 'topArtist' | 'topGenre'>): InsightInput {
  return {
    ...extra,
    topArtist: snapshot.topArtists[0]?.name,
    topGenre: snapshot.genres[0]?.name,
  }
}
