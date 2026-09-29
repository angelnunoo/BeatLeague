export type MusicProviderId = 'demo' | 'spotify' | 'apple'

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'

export type GameMode =
  | 'guess'
  | 'lyric'
  | 'plays'
  | 'listeners'
  | 'release'
  | 'cover'
  | 'who-listens'
  | 'whose-top'
  | 'duel'
  | 'infinite'
  | 'battle'

export type LeagueKind = 'friends' | 'weekly' | 'monthly' | 'musical' | 'player' | 'historic'

export type ShopCategory =
  | 'frame'
  | 'banner'
  | 'avatar'
  | 'background'
  | 'badge'
  | 'title'
  | 'effect'
  | 'animation'

export type Artist = {
  id: string
  name: string
  genre: string
  genreGroup: 'reggaeton' | 'pop' | 'rock' | 'latin' | 'rnb'
  monthlyListeners: number
  palette: [string, string]
}

export type Track = {
  id: string
  title: string
  artistId: string
  album: string
  plays: number
  released: string
}

export type Person = {
  id: string
  name: string
  handle: string
  level: number
  xp: number
  streak: number
  palette: [string, string]
  banner: [string, string]
  title: string
  listening: { artistId: string; minutes: number }[]
  topTrackIds: string[]
  weeklyPoints: number
  monthlyPoints: number
  friendPoints: number
  playerScore: number
  historicPoints?: number
  movement: Partial<Record<LeagueKind, number>>
  activity: string[]
}

export type SnapshotArtist = {
  key: string
  name: string
  genres: string[]
  minutes: number
  listeners?: number
  image?: string
}

export type SnapshotTrack = {
  key: string
  name: string
  artistName: string
  album?: string
  image?: string
  playedAt?: string
  plays?: number
}

export type ListenEvent = {
  key: string
  trackKey: string
  name: string
  artistName: string
  minutes: number
  album?: string
  image?: string
  playedAt?: string
  genres?: string[]
}

export type ListeningSnapshot = {
  provider: MusicProviderId
  displayName: string
  topArtists: SnapshotArtist[]
  topTracks: SnapshotTrack[]
  genres: { name: string; share: number }[]
  recent: SnapshotTrack[]
  listeningMinutes: number
  plays: number
  uniqueTracks: number
  updatedAt: string
  events?: ListenEvent[]
  head?: string[]
}

export type OwnedCard = {
  artistId: string
  rarity: Rarity
  obtainedAt: string
}

export type Relation = 'friend' | 'incoming' | 'outgoing'

export type NotificationKind = 'social' | 'duel' | 'card' | 'level' | 'throne' | 'mission' | 'league'

export type AppNotification = {
  id: string
  kind: NotificationKind
  text: string
  at: string
  read: boolean
  href?: string
}

export type MissionMetric = 'plays' | 'duelWins' | 'correct' | 'streak' | 'score' | 'defenses' | 'epicCards' | 'levels'

export type MissionDef = {
  id: string
  cadence: 'daily' | 'weekly'
  title: string
  metric: MissionMetric
  target: number
  xp: number
  coins: number
}

export type AchievementDef = {
  id: string
  title: string
  detail: string
  metric: 'correct' | 'answered' | 'wins' | 'duelsWon' | 'bestStreak' | 'artistsDiscovered' | 'throneDays' | 'cards'
  target: number
  xp: number
  coins: number
}

export type ShopItem = {
  id: string
  category: ShopCategory
  name: string
  detail: string
  price: number
  palette?: [string, string]
  titleText?: string
}

export type Equipped = {
  frame: string
  banner: string
  avatar: string
  background: string
  badge: string
  title: string
  effect: string
  animation: string
}

export type Lifetime = {
  plays: number
  correct: number
  answered: number
  wins: number
  duelsWon: number
  duelsPlayed: number
  bestStreak: number
  artistsDiscovered: number
  throneDays: number
  cardsEarned: number
}

export type MatchReward = {
  xp: number
  coins: number
  multiplier: number
  leveledUp: boolean
  level: number
  card: OwnedCard | null
  throneAlert: string | null
}

export type QuestionVisual =
  | { type: 'listen'; trackId: string; clues: string[] }
  | { type: 'lyric'; before: string; after: string; trackId: string }
  | { type: 'cover'; trackId: string }
  | { type: 'versus'; left: string; right: string; kind: 'track' | 'artist' }
  | { type: 'top5'; trackIds: string[] }
  | { type: 'plain'; kicker: string }

export type Question = {
  id: string
  prompt: string
  detail?: string
  visual: QuestionVisual
  options: { id: string; label: string; sub?: string }[]
  answerId: string
  seconds: number
  fact: string
}

export type PredictionPick = {
  id: string
  choice: string
  at: string
}
