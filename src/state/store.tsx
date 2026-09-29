import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { ACHIEVEMENTS, MISSIONS, SHOP } from '../data/meta'
import { ME_ID, PEOPLE, personById } from '../data/people'
import { compatibility } from '../domain/compatibility'
import { dayKey, uid, weekKey, yesterdayKey } from '../domain/format'
import { standings } from '../domain/leagues'
import { levelFromXp, RARITY_STARS, rollRarity } from '../domain/progression'
import { calendarReward, PASS_PRICE, streakMultiplier } from '../domain/retention'
import { creditListening, decorateSnapshot, emptyListeningLedger, listeningSummary, type ListeningLedger } from '../domain/listening'
import { buildThrones, throneThreats } from '../domain/thrones'
import { demoSnapshot, snapshotFromPerson } from '../music/snapshot'
import { disconnectApple } from '../music/apple'
import { catalogArtistId, disconnectSpotify, finishSpotifyFromUrl, hasSpotifySession, pullSpotifySnapshot } from '../music/spotify'
import type {
  AppNotification,
  Equipped,
  GameMode,
  LeagueKind,
  Lifetime,
  ListeningSnapshot,
  MatchReward,
  MusicProviderId,
  OwnedCard,
  Person,
  Relation,
  MissionMetric,
} from '../types'

const KEY = 'beatleague.v1'

export type MatchInput = {
  mode: GameMode
  score: number
  correct: number
  total: number
  bestStreak: number
  won: boolean
  artistId?: string
}

type Counters = Partial<Record<MissionMetric, number>>

type State = {
  version: 1
  name: string
  xp: number
  coins: number
  streak: number
  lastDay: string
  relations: Record<string, Relation>
  ownedItems: string[]
  equipped: Equipped
  cards: OwnedCard[]
  artistXp: Record<string, number>
  lifetime: Lifetime
  notifications: AppNotification[]
  missionDay: string
  missionWeek: string
  daily: Counters
  weekly: Counters
  claimed: string[]
  weeklyPoints: number
  monthlyPoints: number
  friendPoints: number
  predictions: Record<string, string>
  claimedPrediction: boolean
  sound: boolean
  haptics: boolean
  provider: MusicProviderId
  snapshot: ListeningSnapshot
  bestInfinite: number
  historicPoints: number
  passXp: number
  premium: boolean
  calendarDay: number
  calendarMonth: string
  lastClaim: string
  throneDefenses: number
  throneRecordDays: number
  accent: string
  ledger: ListeningLedger
}

const BASE_EQUIPPED: Equipped = {
  frame: 'frame-base',
  banner: 'banner-base',
  avatar: 'avatar-base',
  background: 'bg-base',
  badge: '',
  title: '',
  effect: '',
  animation: '',
}

function seed(): State {
  const today = dayKey()
  return {
    version: 1,
    name: 'Ángel',
    xp: 56420,
    coins: 2480,
    streak: 21,
    lastDay: today,
    relations: {
      david: 'friend',
      sergio: 'friend',
      marcos: 'friend',
      lucia: 'friend',
      nora: 'friend',
      hugo: 'incoming',
      alba: 'outgoing',
    },
    ownedItems: [],
    equipped: BASE_EQUIPPED,
    cards: [
      { artistId: 'quevedo', rarity: 'legendary', obtainedAt: new Date().toISOString() },
      { artistId: 'bad-bunny', rarity: 'mythic', obtainedAt: new Date().toISOString() },
      { artistId: 'feid', rarity: 'epic', obtainedAt: new Date().toISOString() },
      { artistId: 'bizarrap', rarity: 'epic', obtainedAt: new Date().toISOString() },
      { artistId: 'weeknd', rarity: 'rare', obtainedAt: new Date().toISOString() },
      { artistId: 'rosalia', rarity: 'common', obtainedAt: new Date().toISOString() },
    ],
    artistXp: {
      quevedo: 1400,
      feid: 1900,
      'bad-bunny': 2700,
      weeknd: 420,
      rosalia: 180,
      bizarrap: 640,
    },
    lifetime: {
      plays: 128,
      correct: 86,
      answered: 640,
      wins: 41,
      duelsWon: 7,
      duelsPlayed: 12,
      bestStreak: 21,
      artistsDiscovered: 64,
      throneDays: 12,
      cardsEarned: 6,
    },
    notifications: [
      note('league', 'David te ha adelantado en la clasificación.', '/liga', 2),
      note('throne', 'Sergio te ha quitado el trono del Reggaetón.', '/tronos', 5),
      note('card', 'Marcos ha conseguido una carta legendaria.', '/perfil/marcos', 8),
      note('duel', 'Sergio te desafía a un duelo.', '/jugar/duel?rival=sergio', 11),
      note('throne', 'Estás a punto de perder el trono de Quevedo.', '/tronos', 1),
      note('league', 'Estás a una victoria de afianzar el liderato semanal.', '/liga', 16),
    ],
    missionDay: today,
    missionWeek: weekKey(),
    daily: { plays: 1, correct: 4 },
    weekly: { plays: 5, duelWins: 3, score: 2400 },
    claimed: [],
    weeklyPoints: 10140,
    monthlyPoints: 38950,
    friendPoints: 8640,
    predictions: {},
    claimedPrediction: false,
    sound: true,
    haptics: true,
    provider: 'demo',
    snapshot: demoSnapshot(),
    bestInfinite: 9,
    historicPoints: 182400,
    passXp: 2140,
    premium: false,
    calendarDay: 6,
    calendarMonth: today.slice(0, 7),
    lastClaim: yesterdayKey(),
    throneDefenses: 4,
    throneRecordDays: 18,
    accent: '#1DB954',
    ledger: emptyListeningLedger(),
  }
}

function note(kind: AppNotification['kind'], text: string, href: string, hours: number): AppNotification {
  return {
    id: uid('seed'),
    kind,
    text,
    href,
    at: new Date(Date.now() - hours * 3600_000).toISOString(),
    read: hours > 12,
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    const base = seed()
    if (!raw) return creditDemo(base)
    const parsed = JSON.parse(raw) as State
    if (parsed.version !== 1 || !parsed.snapshot) return creditDemo(base)
    const artistXp = { ...base.artistXp }
    for (const [id, xp] of Object.entries(parsed.artistXp ?? {})) artistXp[id] = Math.max(artistXp[id] ?? 0, xp)
    const merged: State = {
      ...base,
      ...parsed,
      artistXp,
      equipped: { ...BASE_EQUIPPED, ...parsed.equipped },
      ledger: {
        demo: parsed.ledger?.demo ?? base.ledger.demo,
        spotify: parsed.ledger?.spotify ?? base.ledger.spotify,
        apple: parsed.ledger?.apple ?? base.ledger.apple,
      },
      snapshot: {
        ...parsed.snapshot,
        plays: parsed.snapshot.plays ?? 0,
        uniqueTracks: parsed.snapshot.uniqueTracks ?? parsed.snapshot.topTracks.length,
      },
    }
    if (merged.provider === 'demo' && merged.ledger.demo.keys.length === 0) return creditDemo(merged)
    return merged
  } catch {
    return creditDemo(seed())
  }
}

function creditDemo(state: State) {
  if (state.ledger.demo.keys.length > 0) return state
  return applyListening(state, demoSnapshot()).state
}

function listenArtistId(name: string) {
  for (const part of name.split(',')) {
    const id = catalogArtistId(part.trim())
    if (id) return id
  }
  return null
}

function applyListening(state: State, snapshot: ListeningSnapshot) {
  const source = snapshot.provider
  const gain = creditListening(state.ledger[source] ?? emptyListeningLedger().demo, snapshot.events ?? [], snapshot.head ?? [])
  const artistXp = { ...state.artistXp }
  for (const [name, minutes] of Object.entries(gain.artistMinutes)) {
    const id = listenArtistId(name)
    if (!id) continue
    artistXp[id] = (artistXp[id] ?? 0) + Math.round(minutes)
  }
  const summary = listeningSummary(gain, source === 'spotify' ? 'Spotify' : source === 'apple' ? 'Apple Music' : 'Demo')
  return {
    summary,
    state: {
      ...state,
      provider: source,
      snapshot: decorateSnapshot({ ...snapshot, displayName: snapshot.displayName || state.name }, gain.ledger),
      ledger: { ...state.ledger, [source]: gain.ledger },
      artistXp,
      xp: state.xp + gain.xp,
      passXp: state.passXp + gain.xp,
      coins: state.coins + gain.coins,
      weeklyPoints: state.weeklyPoints + gain.points,
      monthlyPoints: state.monthlyPoints + gain.points,
      friendPoints: state.friendPoints + gain.points,
      historicPoints: state.historicPoints + gain.points,
      notifications: gain.points > 0 ? pushNote(state.notifications, 'league', summary, '/estadisticas') : state.notifications,
    } satisfies State,
  }
}

function rollPeriods(state: State): State {
  const today = dayKey()
  const week = weekKey()
  let next = state
  if (state.missionDay !== today) {
    next = { ...next, missionDay: today, daily: {}, claimed: next.claimed.filter((id) => !id.startsWith('daily:')) }
  }
  if (state.missionWeek !== week) {
    next = { ...next, missionWeek: week, weekly: {}, claimed: next.claimed.filter((id) => !id.startsWith('weekly:')) }
  }
  return next
}

function pushNote(list: AppNotification[], kind: AppNotification['kind'], text: string, href?: string) {
  return [{ id: uid('n'), kind, text, href, at: new Date().toISOString(), read: false }, ...list].slice(0, 40)
}

function maybeCard(state: State, luck: number): OwnedCard | null {
  if (Math.random() > 0.42 + luck) return null
  const rarity = rollRarity(luck)
  const owned = new Set(state.cards.map((card) => card.artistId))
  const pool = ['quevedo', 'bad-bunny', 'feid', 'rosalia', 'taylor', 'weeknd', 'arctic', 'dua', 'bizarrap', 'karol', 'rauw', 'aitana', 'billie', 'dragons', 'coldplay']
  const fresh = pool.filter((id) => !owned.has(id))
  const artistId = (fresh.length ? fresh : pool)[Math.floor(Math.random() * (fresh.length ? fresh.length : pool.length))]
  return { artistId, rarity, obtainedAt: new Date().toISOString() }
}

function mergeCard(cards: OwnedCard[], card: OwnedCard) {
  const existing = cards.find((item) => item.artistId === card.artistId)
  if (!existing) return [card, ...cards]
  if (RARITY_STARS[card.rarity] > RARITY_STARS[existing.rarity]) {
    return cards.map((item) => (item.artistId === card.artistId ? card : item))
  }
  return cards
}

export function applyMatch(state: State, input: MatchInput) {
  const next = rollPeriods(state)
  const today = dayKey()
  const streak = next.lastDay === today ? next.streak : next.lastDay === yesterdayKey() ? next.streak + 1 : 1
  const before = levelFromXp(next.xp)
  const multiplier = streakMultiplier(streak)
  const xpGain = Math.round(
    (20 +
      input.correct * 8 +
      (input.won ? 70 : 18) +
      Math.round(input.score / 45) +
      (input.mode === 'duel' && input.won ? 50 : 0) +
      (input.mode === 'infinite' ? input.bestStreak * 6 : 0) +
      (input.mode === 'battle' && input.won ? 40 : 0)) *
      multiplier,
  )
  const coinsGain = 10 + input.correct * 2 + (input.won ? 24 : 0) + (input.mode === 'infinite' ? input.bestStreak : 0)
  const xp = next.xp + xpGain
  const after = levelFromXp(xp)
  const card = maybeCard(next, input.won ? 0.2 : 0)
  const cards = card ? mergeCard(next.cards, card) : next.cards
  const artistXp = { ...next.artistXp }
  if (input.artistId) artistXp[input.artistId] = (artistXp[input.artistId] ?? 0) + 24 + input.correct * 6
  const discovered = card && !next.cards.some((item) => item.artistId === card.artistId)
  const lifetime: Lifetime = {
    ...next.lifetime,
    plays: next.lifetime.plays + 1,
    correct: next.lifetime.correct + input.correct,
    answered: next.lifetime.answered + input.total,
    wins: next.lifetime.wins + (input.won ? 1 : 0),
    duelsWon: next.lifetime.duelsWon + (input.mode === 'duel' && input.won ? 1 : 0),
    duelsPlayed: next.lifetime.duelsPlayed + (input.mode === 'duel' ? 1 : 0),
    bestStreak: Math.max(next.lifetime.bestStreak, streak),
    artistsDiscovered: next.lifetime.artistsDiscovered + (discovered ? 1 : 0),
    cardsEarned: next.lifetime.cardsEarned + (discovered ? 1 : 0),
  }
  const bump = (bag: Counters): Counters => ({
    plays: (bag.plays ?? 0) + 1,
    correct: (bag.correct ?? 0) + input.correct,
    streak: 1,
    duelWins: (bag.duelWins ?? 0) + (input.mode === 'duel' && input.won ? 1 : 0),
    score: (bag.score ?? 0) + input.score,
  })
  const gained = Math.max(15, Math.round(input.score / 18))
  let notifications = next.notifications
  if (after.level > before.level) {
    notifications = pushNote(notifications, 'level', `Has subido al nivel ${after.level}.`, '/perfil')
  }
  if (card && discovered) {
    notifications = pushNote(notifications, 'card', 'Has conseguido una nueva carta.', '/cartas')
  }
  const throneAlert = input.mode === 'battle' && input.won ? 'La batalla aprieta el trono. La corona sigue dependiendo de la escucha real.' : null
  const previous = card ? next.cards.find((item) => item.artistId === card.artistId) : undefined
  const cardReward = card && (!previous || RARITY_STARS[card.rarity] > RARITY_STARS[previous.rarity]) ? card : null
  const reward: MatchReward = {
    xp: xpGain,
    coins: coinsGain,
    multiplier,
    leveledUp: after.level > before.level,
    level: after.level,
    card: cardReward,
    throneAlert,
  }
  const epic = Boolean(cardReward && (cardReward.rarity === 'epic' || cardReward.rarity === 'legendary' || cardReward.rarity === 'mythic'))
  const daily = bump(next.daily)
  const weekly = bump(next.weekly)
  if (input.mode === 'battle' && input.won) daily.defenses = (daily.defenses ?? 0) + 1
  if (epic) weekly.epicCards = (weekly.epicCards ?? 0) + 1
  if (after.level > before.level) weekly.levels = (weekly.levels ?? 0) + (after.level - before.level)
  return {
    reward,
    state: {
      ...next,
      xp,
      coins: next.coins + coinsGain,
      streak,
      lastDay: today,
      cards,
      artistXp,
      lifetime,
      daily,
      weekly,
      weeklyPoints: next.weeklyPoints + gained,
      monthlyPoints: next.monthlyPoints + gained,
      friendPoints: next.friendPoints + Math.round(gained * 0.7),
      historicPoints: next.historicPoints + gained,
      passXp: next.passXp + xpGain,
      throneDefenses: next.throneDefenses + (input.mode === 'battle' && input.won ? 1 : 0),
      notifications,
      bestInfinite: Math.max(next.bestInfinite, input.mode === 'infinite' ? input.bestStreak : 0),
    } satisfies State,
  }
}

function createApi(state: State, setState: Dispatch<SetStateAction<State>>, spotifyError: string, setSpotifyError: (value: string) => void) {
  const me = mePerson(state)
  const friendIds = Object.entries(state.relations)
    .filter(([, relation]) => relation === 'friend')
    .map(([id]) => id)
  const friends = friendIds.map((id) => personById(id))
  const seats = [me, ...PEOPLE.filter((person) => person.id !== ME_ID)].map((person) => ({
    personId: person.id,
    name: person.id === ME_ID ? state.name : person.name,
    snapshot: person.id === ME_ID ? state.snapshot : snapshotFromPerson(person),
  }))
  const thrones = buildThrones(seats)
  const progress = levelFromXp(state.xp)

  const update = (recipe: (current: State) => State) => setState((current) => recipe(rollPeriods(current)))

  return {
    state,
    me,
    progress,
    friends,
    incoming: peopleWith(state, 'incoming'),
    outgoing: peopleWith(state, 'outgoing'),
    directory: PEOPLE.filter((person) => person.id !== ME_ID),
    snapshot: state.snapshot,
    thrones,
    myThrones: thrones.filter((throne) => throne.holderId === ME_ID),
    threats: throneThreats(thrones, ME_ID),
    unread: state.notifications.filter((item) => !item.read).length,
    spotifyError,
    standings: (kind: LeagueKind) => standings(kind, me, friendIds),
    compat: (person: Person) => compatibility(state.snapshot, snapshotFromPerson(person)),
    missionProgress: (cadence: 'daily' | 'weekly', metric: keyof Counters) => {
      const bag = cadence === 'daily' ? state.daily : state.weekly
      return bag[metric] ?? 0
    },
    missionClaimed: (id: string, cadence: 'daily' | 'weekly') => state.claimed.includes(`${cadence}:${id}`),
    achievementValue: (metric: (typeof ACHIEVEMENTS)[number]['metric']) => {
      if (metric === 'cards') return state.cards.length
      return state.lifetime[metric]
    },
    finishMatch: (input: MatchInput) => {
      const applied = applyMatch(state, input)
      setState(applied.state)
      return applied.reward
    },
    claimMission: (id: string) => {
      const mission = MISSIONS.find((item) => item.id === id)
      if (!mission) return
      update((current) => {
        const key = `${mission.cadence}:${mission.id}`
        if (current.claimed.includes(key)) return current
        const bag = mission.cadence === 'daily' ? current.daily : current.weekly
        if ((bag[mission.metric] ?? 0) < mission.target) return current
        const after = levelFromXp(current.xp + mission.xp)
        const before = levelFromXp(current.xp)
        let notifications = pushNote(current.notifications, 'mission', `Misión cumplida: ${mission.title}.`, '/misiones')
        if (after.level > before.level) notifications = pushNote(notifications, 'level', `Has subido al nivel ${after.level}.`, '/perfil')
        return {
          ...current,
          xp: current.xp + mission.xp,
          coins: current.coins + mission.coins,
          passXp: current.passXp + mission.xp,
          claimed: [...current.claimed, key],
          notifications,
        }
      })
    },
    buy: (id: string) => {
      const item = SHOP.find((entry) => entry.id === id)
      if (!item) return 'Ese artículo no existe.'
      if (state.ownedItems.includes(id)) return 'Ya lo tienes.'
      if (state.coins < item.price) return 'No tienes Beats suficientes.'
      update((current) => {
        if (current.ownedItems.includes(id) || current.coins < item.price) return current
        return {
          ...current,
          coins: current.coins - item.price,
          ownedItems: [...current.ownedItems, id],
          equipped: { ...current.equipped, [item.category]: id },
        }
      })
      return null
    },
    equip: (id: string) => {
      const item = SHOP.find((entry) => entry.id === id)
      if (!item || !state.ownedItems.includes(id)) return
      update((current) => ({ ...current, equipped: { ...current.equipped, [item.category]: id } }))
    },
    unequip: (category: keyof Equipped) => {
      const empty = category === 'badge' || category === 'title' || category === 'effect' || category === 'animation'
      update((current) => ({
        ...current,
        equipped: { ...current.equipped, [category]: empty ? '' : BASE_EQUIPPED[category] },
      }))
    },
    requestFriend: (id: string) => {
      update((current) => {
        if (current.relations[id]) return current
        return {
          ...current,
          relations: { ...current.relations, [id]: 'outgoing' },
          notifications: pushNote(current.notifications, 'social', `Has invitado a ${personById(id).name}.`, '/amigos'),
        }
      })
    },
    acceptFriend: (id: string) => {
      update((current) => ({
        ...current,
        relations: { ...current.relations, [id]: 'friend' },
        notifications: pushNote(current.notifications, 'social', `${personById(id).name} ya está en tu liga.`, '/amigos'),
      }))
    },
    removeRelation: (id: string) => {
      update((current) => {
        const relations = { ...current.relations }
        delete relations[id]
        return { ...current, relations }
      })
    },
    readNotification: (id: string) => {
      update((current) => ({
        ...current,
        notifications: current.notifications.map((item) => (item.id === id ? { ...item, read: true } : item)),
      }))
    },
    readAll: () => {
      update((current) => ({
        ...current,
        notifications: current.notifications.map((item) => ({ ...item, read: true })),
      }))
    },
    predict: (id: string, choice: string) => {
      update((current) => ({ ...current, predictions: { ...current.predictions, [id]: choice } }))
    },
    claimPrediction: () => {
      update((current) => {
        if (current.claimedPrediction) return current
        return {
          ...current,
          claimedPrediction: true,
          xp: current.xp + 90,
          coins: current.coins + 50,
          notifications: pushNote(current.notifications, 'mission', 'Predicción cerrada: Bad Bunny. Premio recogido.', '/predice'),
        }
      })
    },
    setName: (name: string) => update((current) => ({ ...current, name: name.slice(0, 18) || 'Ángel' })),
    setSound: (sound: boolean) => update((current) => ({ ...current, sound })),
    setHaptics: (haptics: boolean) => update((current) => ({ ...current, haptics })),
    useDemoMusic: () => {
      disconnectSpotify()
      void disconnectApple()
      update((current) => applyListening({ ...current, provider: 'demo' }, demoSnapshot()).state)
    },
    adoptSnapshot: (snapshot: ListeningSnapshot) => {
      let summary = 'Escucha actualizada.'
      update((current) => {
        const applied = applyListening(current, snapshot)
        summary = applied.summary
        return applied.state
      })
      return summary
    },
    claimCalendar: () => {
      const today = dayKey()
      if (state.lastClaim === today) return 'El calendario de hoy ya está recogido.'
      const month = today.slice(0, 7)
      const day = state.calendarMonth === month ? Math.min(30, state.calendarDay + 1) : 1
      const reward = calendarReward(day)
      update((current) => {
        if (current.lastClaim === today) return current
        let cards = current.cards
        let ownedItems = current.ownedItems
        if (reward.card === 'exclusive' && !ownedItems.includes('frame-gold')) ownedItems = [...ownedItems, 'frame-gold']
        if (reward.card === 'epic' || reward.card === 'common') {
          const artistId = ['feid', 'quevedo', 'bad-bunny', 'karol'][day % 4] ?? 'feid'
          const rarity = reward.card === 'epic' ? 'epic' : 'rare'
          if (!cards.some((item) => item.artistId === artistId)) {
            cards = [{ artistId, rarity, obtainedAt: new Date().toISOString() }, ...cards]
          }
        }
        return {
          ...current,
          calendarDay: day,
          calendarMonth: month,
          lastClaim: today,
          coins: current.coins + reward.coins,
          xp: current.xp + reward.xp,
          passXp: current.passXp + reward.xp,
          cards,
          ownedItems,
          notifications: pushNote(current.notifications, 'mission', `Día ${day} del calendario: ${reward.label}.`, '/calendario'),
        }
      })
      return `Día ${day}: ${reward.label}. ${reward.detail}.`
    },
    unlockPremium: () => {
      if (state.premium) return 'El Beat Pass ya está activo.'
      if (state.coins < PASS_PRICE) return 'No tienes Beats suficientes.'
      update((current) => {
        if (current.premium || current.coins < PASS_PRICE) return current
        return {
          ...current,
          premium: true,
          coins: current.coins - PASS_PRICE,
          notifications: pushNote(current.notifications, 'mission', 'Beat Pass premium activado.', '/temporada'),
        }
      })
      return null
    },
    setAccent: (accent: string) => update((current) => ({ ...current, accent })),
    reset: () => {
      disconnectSpotify()
      void disconnectApple()
      setState(creditDemo(seed()))
    },
    clearSpotifyError: () => setSpotifyError(''),
  }
}

function mePerson(state: State): Person {
  const base = personById(ME_ID)
  return {
    ...base,
    name: state.name,
    xp: state.xp,
    level: levelFromXp(state.xp).level,
    streak: state.streak,
    weeklyPoints: state.weeklyPoints,
    monthlyPoints: state.monthlyPoints,
    friendPoints: state.friendPoints,
    playerScore: state.xp,
    historicPoints: state.historicPoints,
  }
}

function peopleWith(state: State, relation: Relation) {
  return Object.entries(state.relations)
    .filter(([, value]) => value === relation)
    .map(([id]) => personById(id))
}

const GameContext = createContext<ReturnType<typeof createApi> | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(() => load())
  const [spotifyError, setSpotifyError] = useState('')
  const booted = useRef(false)

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (booted.current) return
    booted.current = true
    void (async () => {
      try {
        const fromRedirect = await finishSpotifyFromUrl()
        const snapshot = fromRedirect ?? (hasSpotifySession() ? await pullSpotifySnapshot() : null)
        if (!snapshot) return
        setState((current) => applyListening(current, snapshot).state)
      } catch (error: unknown) {
        setSpotifyError(error instanceof Error ? error.message : 'Spotify no respondió.')
      }
    })()
  }, [])

  const api = useMemo(() => createApi(state, setState, spotifyError, setSpotifyError), [state, spotifyError])
  return <GameContext.Provider value={api}>{children}</GameContext.Provider>
}

export function useGame() {
  const value = useContext(GameContext)
  if (!value) throw new Error('useGame necesita GameProvider')
  return value
}
