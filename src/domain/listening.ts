import type { ListenEvent, ListeningSnapshot, MusicProviderId, SnapshotArtist, SnapshotTrack } from '../types'

export const POINTS_PER_SONG = 15
export const POINTS_PER_PLAY = 6
export const POINTS_PER_MINUTE = 2

export type TrackMemory = {
  name: string
  artistName: string
  album?: string
  image?: string
  playedAt?: string
}

export type SourceLedger = {
  keys: string[]
  plays: number
  songs: string[]
  minutes: number
  points: number
  artistMinutes: Record<string, number>
  trackPlays: Record<string, number>
  tracks: Record<string, TrackMemory>
  head: string[]
}

export type ListeningLedger = Record<MusicProviderId, SourceLedger>

export function emptyLedger(): SourceLedger {
  return { keys: [], plays: 0, songs: [], minutes: 0, points: 0, artistMinutes: {}, trackPlays: {}, tracks: {}, head: [] }
}

export function emptyListeningLedger(): ListeningLedger {
  return { demo: emptyLedger(), spotify: emptyLedger(), apple: emptyLedger() }
}

export type ListeningGain = {
  ledger: SourceLedger
  points: number
  xp: number
  coins: number
  plays: number
  songs: number
  minutes: number
  artistMinutes: Record<string, number>
}

export function creditListening(ledger: SourceLedger, events: ListenEvent[], head: string[] = []): ListeningGain {
  const known = new Set(ledger.keys)
  const songs = new Set(ledger.songs)
  const fresh = events.filter((event) => event.key && !known.has(event.key))
  const artistMinutes: Record<string, number> = {}
  let minutes = 0
  let newSongs = 0
  const nextSongs = [...ledger.songs]
  const trackPlays = { ...ledger.trackPlays }
  const tracks = { ...ledger.tracks }
  const nextArtist = { ...ledger.artistMinutes }

  for (const event of fresh) {
    known.add(event.key)
    minutes += event.minutes
    const artist = event.artistName.trim()
    artistMinutes[artist] = (artistMinutes[artist] ?? 0) + event.minutes
    nextArtist[artist] = (nextArtist[artist] ?? 0) + event.minutes
    trackPlays[event.trackKey] = (trackPlays[event.trackKey] ?? 0) + 1
    tracks[event.trackKey] = {
      name: event.name,
      artistName: event.artistName,
      album: event.album,
      image: event.image,
      playedAt: event.playedAt ?? tracks[event.trackKey]?.playedAt,
    }
    if (!songs.has(event.trackKey)) {
      songs.add(event.trackKey)
      nextSongs.push(event.trackKey)
      newSongs += 1
    }
  }

  const points = newSongs * POINTS_PER_SONG + fresh.length * POINTS_PER_PLAY + Math.round(minutes * POINTS_PER_MINUTE)
  const keys = [...known].slice(-800)
  return {
    ledger: {
      keys,
      plays: ledger.plays + fresh.length,
      songs: nextSongs,
      minutes: ledger.minutes + minutes,
      points: ledger.points + points,
      artistMinutes: nextArtist,
      trackPlays,
      tracks,
      head: head.length ? head : ledger.head,
    },
    points,
    xp: Math.round(points * 0.4),
    coins: Math.round(fresh.length * 0.5),
    plays: fresh.length,
    songs: newSongs,
    minutes: Math.round(minutes),
    artistMinutes,
  }
}

export function decorateSnapshot(snapshot: ListeningSnapshot, ledger: SourceLedger): ListeningSnapshot {
  const artists = new Map<string, SnapshotArtist>()
  for (const artist of snapshot.topArtists) {
    artists.set(artist.name, { ...artist, minutes: Math.round(ledger.artistMinutes[artist.name] ?? artist.minutes) })
  }
  for (const [name, minutes] of Object.entries(ledger.artistMinutes)) {
    if (artists.has(name)) continue
    artists.set(name, { key: name.toLowerCase(), name, genres: ['Música'], minutes: Math.round(minutes) })
  }
  const topArtists = [...artists.values()].sort((a, b) => b.minutes - a.minutes).slice(0, 8)
  const genreWeights = new Map<string, number>()
  for (const artist of topArtists) {
    const weight = Math.max(1, artist.minutes)
    for (const genre of artist.genres) genreWeights.set(genre, (genreWeights.get(genre) ?? 0) + weight)
  }
  const genreTotal = [...genreWeights.values()].reduce((sum, value) => sum + value, 0) || 1
  const topTracks: SnapshotTrack[] = Object.entries(ledger.trackPlays)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key, plays]) => {
      const memory = ledger.tracks[key]
      return {
        key,
        name: memory?.name ?? key,
        artistName: memory?.artistName ?? '',
        album: memory?.album,
        image: memory?.image,
        playedAt: memory?.playedAt,
        plays,
      }
    })
  const recent = [...snapshot.events ?? []]
    .slice()
    .sort((a, b) => (b.playedAt ?? '').localeCompare(a.playedAt ?? ''))
    .slice(0, 10)
    .map((event) => ({
      key: event.trackKey,
      name: event.name,
      artistName: event.artistName,
      album: event.album,
      image: event.image,
      playedAt: event.playedAt,
    }))

  return {
    provider: snapshot.provider,
    displayName: snapshot.displayName,
    topArtists,
    topTracks: topTracks.length ? topTracks : snapshot.topTracks,
    genres: [...genreWeights.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, weight]) => ({ name, share: weight / genreTotal })),
    recent: recent.length ? recent : snapshot.recent,
    listeningMinutes: Math.round(ledger.minutes || snapshot.listeningMinutes),
    plays: ledger.plays,
    uniqueTracks: ledger.songs.length,
    updatedAt: snapshot.updatedAt,
  }
}

export function listeningSummary(gain: Pick<ListeningGain, 'points' | 'songs' | 'plays' | 'minutes'>, source: string) {
  if (gain.points <= 0) return `${source} al día. No hay reproducciones nuevas.`
  return `${source}: ${gain.songs} canciones nuevas, ${gain.plays} reproducciones, ${gain.minutes} min. +${gain.points} puntos.`
}
