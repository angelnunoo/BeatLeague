import type { ListenEvent, ListeningSnapshot } from '../types'

const DEVELOPER_TOKEN = import.meta.env.VITE_APPLE_MUSIC_TOKEN ?? ''
const FLAG_KEY = 'beatleague.apple.linked'

type AppleSong = {
  id: string
  attributes?: {
    name?: string
    artistName?: string
    albumName?: string
    durationInMillis?: number
    genreNames?: string[]
    artwork?: { url?: string }
  }
}

type MusicKitInstance = {
  authorize: () => Promise<string>
  unauthorize: () => Promise<void>
  isAuthorized: boolean
  api: {
    music: (path: string, query?: Record<string, string | number>) => Promise<unknown>
  }
}

type MusicKitGlobal = {
  configure: (config: { developerToken: string; app: { name: string; build: string } }) => Promise<void>
  getInstance: () => MusicKitInstance
}

declare global {
  interface Window {
    MusicKit?: MusicKitGlobal
  }
}

export function isAppleConfigured() {
  return DEVELOPER_TOKEN.length > 0
}

export function hasAppleSession() {
  return isAppleConfigured() && localStorage.getItem(FLAG_KEY) === '1'
}

export async function disconnectApple() {
  localStorage.removeItem(FLAG_KEY)
  if (!window.MusicKit) return
  try {
    const music = window.MusicKit.getInstance()
    if (music.isAuthorized) await music.unauthorize()
  } catch {
    /* La sesión local ya quedó cerrada. */
  }
}

async function loadKit() {
  if (window.MusicKit) return window.MusicKit
  await new Promise<void>((resolve, reject) => {
    const ready = () => resolve()
    document.addEventListener('musickitloaded', ready, { once: true })
    const script = document.createElement('script')
    script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js'
    script.async = true
    script.onerror = () => reject(new Error('No se pudo cargar Apple Music.'))
    document.head.appendChild(script)
  })
  if (!window.MusicKit) throw new Error('Apple Music no arrancó en este navegador.')
  return window.MusicKit
}

async function instance() {
  if (!DEVELOPER_TOKEN) throw new Error('Añade VITE_APPLE_MUSIC_TOKEN para abrir Apple Music.')
  const kit = await loadKit()
  await kit.configure({
    developerToken: DEVELOPER_TOKEN,
    app: { name: 'BeatLeague', build: '1.0.0' },
  })
  return kit.getInstance()
}

export async function beginAppleLogin() {
  const music = await instance()
  await music.authorize()
  localStorage.setItem(FLAG_KEY, '1')
  return pullAppleSnapshot([])
}

export async function pullAppleSnapshot(previousHead: string[] = []): Promise<ListeningSnapshot> {
  const music = await instance()
  if (!music.isAuthorized && !hasAppleSession()) throw new Error('Apple Music no está autorizado.')
  if (!music.isAuthorized) await music.authorize()
  const [tracks, heavy] = await Promise.all([
    music.api.music('/v1/me/recent/played/tracks', { limit: 30 }),
    music.api.music('/v1/me/history/heavy-rotation', { limit: 10 }).catch(() => ({ data: [] })),
  ])
  const songs = [...readSongs(tracks), ...readSongs(heavy)]
  const seen = new Set<string>()
  const ordered = songs.filter((song) => {
    if (seen.has(song.id)) return false
    seen.add(song.id)
    return true
  })
  const ids = ordered.map((song) => song.id)
  const freshIds = freshSince(ids, previousHead)
  const anchor = previousHead[0] ?? 'seed'
  const events: ListenEvent[] = freshIds.map((id, index) => {
    const song = ordered.find((item) => item.id === id)
    const attributes = song?.attributes
    return {
      key: `apple:${anchor}:${index}:${id}`,
      trackKey: id,
      name: attributes?.name ?? 'Canción',
      artistName: attributes?.artistName ?? 'Artista',
      minutes: (attributes?.durationInMillis ?? 0) / 60000 || 3.5,
      album: attributes?.albumName,
      image: attributes?.artwork?.url?.replace('{w}', '300').replace('{h}', '300'),
      genres: attributes?.genreNames?.length ? attributes.genreNames : ['Música'],
    }
  })
  const genreWeights = new Map<string, number>()
  for (const event of events) {
    for (const genre of event.genres ?? []) genreWeights.set(genre, (genreWeights.get(genre) ?? 0) + event.minutes)
  }
  const genreTotal = [...genreWeights.values()].reduce((sum, value) => sum + value, 0) || 1
  return {
    provider: 'apple',
    displayName: 'Apple Music',
    topArtists: artistRows(events),
    topTracks: events.slice(0, 8).map((event) => ({
      key: event.trackKey,
      name: event.name,
      artistName: event.artistName,
      album: event.album,
      image: event.image,
    })),
    genres: [...genreWeights.entries()].map(([name, weight]) => ({ name, share: weight / genreTotal })),
    recent: events.slice(0, 10).map((event) => ({
      key: event.trackKey,
      name: event.name,
      artistName: event.artistName,
      album: event.album,
      image: event.image,
    })),
    listeningMinutes: Math.round(events.reduce((sum, event) => sum + event.minutes, 0)),
    plays: events.length,
    uniqueTracks: new Set(events.map((event) => event.trackKey)).size,
    updatedAt: new Date().toISOString(),
    events,
    head: ids,
  }
}

function freshSince(ids: string[], previousHead: string[]) {
  if (previousHead.length === 0) return ids
  const cut = ids.indexOf(previousHead[0])
  return cut === -1 ? ids : ids.slice(0, cut)
}

function artistRows(events: ListenEvent[]) {
  const minutes = new Map<string, { minutes: number; genres: string[] }>()
  for (const event of events) {
    const current = minutes.get(event.artistName) ?? { minutes: 0, genres: event.genres ?? ['Música'] }
    current.minutes += event.minutes
    minutes.set(event.artistName, current)
  }
  return [...minutes.entries()]
    .sort((a, b) => b[1].minutes - a[1].minutes)
    .slice(0, 8)
    .map(([name, row]) => ({
      key: name.toLowerCase(),
      name,
      genres: row.genres,
      minutes: Math.round(row.minutes),
    }))
}

function readSongs(payload: unknown): AppleSong[] {
  const root = payload as { data?: { data?: AppleSong[] } | AppleSong[] }
  const data = root?.data
  if (Array.isArray(data)) return data.filter((item) => item?.id)
  if (data && Array.isArray(data.data)) return data.data.filter((item) => item?.id)
  return []
}
