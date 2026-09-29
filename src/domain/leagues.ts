import { PEOPLE } from '../data/people'
import type { LeagueKind, Person } from '../types'

export type Standing = {
  person: Person
  points: number
  rank: number
  movement: number
  delta: number
}

function pointsFor(person: Person, kind: LeagueKind) {
  if (kind === 'weekly') return person.weeklyPoints
  if (kind === 'monthly') return person.monthlyPoints
  if (kind === 'friends') return person.friendPoints
  if (kind === 'player') return person.playerScore
  if (kind === 'historic') return person.historicPoints ?? person.playerScore + person.monthlyPoints
  return person.listening.reduce((sum, row) => sum + row.minutes, 0)
}

export function standings(kind: LeagueKind, me: Person, friendIds: string[]): Standing[] {
  const pool = PEOPLE.filter((person) => person.id === me.id || friendIds.includes(person.id) || (kind !== 'friends' && kind !== 'musical'))
  const rows = pool.map((person) => {
    const source = person.id === me.id ? me : person
    return {
      person: source,
      points: pointsFor(source, kind),
      movement: source.movement[kind] ?? 0,
    }
  })
  rows.sort((a, b) => b.points - a.points)
  const leader = rows[0]?.points ?? 0
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
    delta: leader - row.points,
  }))
}

export const LEAGUE_META: { id: LeagueKind; label: string; detail: string }[] = [
  { id: 'friends', label: 'Liga de amigos', detail: 'Solo tu círculo. Aquí se decide la rivalidad.' },
  { id: 'weekly', label: 'Liga semanal', detail: 'Se reinicia cada lunes en el servidor de liga.' },
  { id: 'monthly', label: 'Liga mensual', detail: 'Constancia contra picos de un solo día.' },
  { id: 'musical', label: 'Ranking musical', detail: 'Minutos reales de escucha dentro del círculo.' },
  { id: 'player', label: 'Ranking de jugador', detail: 'XP, duelos y precisión. El oído también se entrena.' },
  { id: 'historic', label: 'Ranking histórico', detail: 'No se reinicia. Cada punto de la liga se queda aquí.' },
]
