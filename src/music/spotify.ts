import { artistById } from '../data/catalog'
import type { ListeningSnapshot, SnapshotArtist, SnapshotTrack } from '../types'

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? ''
const TOKEN_KEY = 'beatleague.spotify.token'
const VERIFIER_KEY = 'beatleague.spotify.verifier'

type TokenBag = {
  access: string
  refresh: string
  expires: number
}

export function isSpotifyConfigured() {
  return CLIENT_ID.length > 0
}

export function redirectUri() {
  return import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${location.origin}/ajustes`
}

function randomVerifier() {
  const bytes = new Uint8Array(48)
  crypto.getRandomValues(bytes)
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

async function challengeFor(verifier: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

export async function beginSpotifyLogin() {
  if (!CLIENT_ID) throw new Error('Añade VITE_SPOTIFY_CLIENT_ID para abrir Spotify.')
  const verifier = randomVerifier()
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  const challenge = await challengeFor(verifier)
  const url = new URL('https://accounts.spotify.com/authorize')
  url.searchParams.set('client_id', CLIENT_ID)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', redirectUri())
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('code_challenge', challenge)
  url.searchParams.set('scope', 'user-top-read user-read-recently-played user-read-email')
  location.assign(url.toString())
}

async function tokenRequest(body: URLSearchParams) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) throw new Error('Spotify no entregó el token.')
  const json = (await response.json()) as { access_token: string; refresh_token?: string; expires_in: number }
  const previous = readToken()
  const bag: TokenBag = {
    access: json.access_token,
    refresh: json.refresh_token ?? previous?.refresh ?? '',
    expires: Date.now() + json.expires_in * 1000,
  }
  localStorage.setItem(TOKEN_KEY, JSON.stringify(bag))
  return bag
}

function readToken(): TokenBag | null {
  const raw = localStorage.getItem(TOKEN_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as TokenBag
  } catch {
    return null
  }
}

async function freshToken() {
  const bag = readToken()
  if (!bag) return null
  if (bag.expires > Date.now() + 30_000) return bag.access
  if (!bag.refresh) return null
  const renewed = await tokenRequest(
    new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'refresh_token',
      refresh_token: bag.refresh,
    }),
  )
  return renewed.access
}

export async function finishSpotifyFromUrl() {
  const params = new URLSearchParams(location.search)
  const code = params.get('code')
  if (!code || !CLIENT_ID) return null
  const verifier = sessionStorage.getItem(VERIFIER_KEY) ?? ''
  await tokenRequest(
    new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri(),
      code_verifier: verifier,
    }),
  )
  sessionStorage.removeItem(VERIFIER_KEY)
  history.replaceState({}, '', location.pathname)
  return pullSpotifySnapshot()
}

export function disconnectSpotify() {
  localStorage.removeItem(TOKEN_KEY)
}

export function hasSpotifySession() {
  return Boolean(readToken())
}

async function spotifyGet<T>(path: string, token: string) {
  const response = await fetch(`https://api.spotify.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('No se pudo leer tu biblioteca de Spotify.')
  return (await response.json()) as T
}

type SpotifyArtist = { id: string; name: string; genres: string[]; popularity: number; images?: { url: string }[] }
type SpotifyTrack = {
  id: string
  name: string
  popularity: number
  duration_ms: number
  album?: { name: string; images?: { url: string }[] }
  artists: { name: string }[]
}
type SpotifyPlayed = { played_at: string; track: SpotifyTrack }

export async function pullSpotifySnapshot(): Promise<ListeningSnapshot> {
  const token = await freshToken()
  if (!token) throw new Error('La sesión de Spotify no está activa.')
  const [me, artists, tracks, recent] = await Promise.all([
    spotifyGet<{ display_name: string }>('/me', token),
    spotifyGet<{ items: SpotifyArtist[] }>('/me/top/artists?limit=8&time_range=medium_term', token),
    spotifyGet<{ items: SpotifyTrack[] }>('/me/top/tracks?limit=8&time_range=medium_term', token),
    collectRecent(token),
  ])

  const topArtists: SnapshotArtist[] = artists.items.map((artist) => ({
    key: artist.name.toLowerCase(),
    name: artist.name,
    genres: artist.genres.length ? artist.genres.map(labelGenre) : ['Música'],
    minutes: 0,
    listeners: artist.popularity * 1_000_000,
    image: artist.images?.[0]?.url,
  }))

  const mapTrack = (track: SpotifyTrack, playedAt?: string): SnapshotTrack => ({
    key: track.name.toLowerCase(),
    name: track.name,
    artistName: track.artists.map((artist) => artist.name).join(', '),
    album: track.album?.name,
    image: track.album?.images?.[0]?.url,
    playedAt,
  })

  const genreWeights = new Map<string, number>()
  for (const artist of topArtists) {
    for (const genre of artist.genres) genreWeights.set(genre, (genreWeights.get(genre) ?? 0) + artist.minutes)
  }
  const genreTotal = [...genreWeights.values()].reduce((sum, value) => sum + value, 0) || 1
  const recentItems = recent.items.map((item) => mapTrack(item.track, item.played_at))
  const events = recent.items.map((item) => ({
    key: `${item.played_at}|${item.track.id}`,
    trackKey: item.track.id,
    name: item.track.name,
    artistName: item.track.artists[0]?.name ?? 'Artista',
    minutes: item.track.duration_ms / 60000,
    album: item.track.album?.name,
    image: item.track.album?.images?.[0]?.url,
    playedAt: item.played_at,
    genres: genresFor(item.track.artists.map((artist) => artist.name), artists.items),
  }))
  const playMinutes = events.reduce((sum, event) => sum + event.minutes, 0)

  return {
    provider: 'spotify',
    displayName: me.display_name,
    topArtists,
    topTracks: tracks.items.map((track) => mapTrack(track)),
    genres: [...genreWeights.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, weight]) => ({ name, share: weight / genreTotal })),
    recent: recentItems,
    listeningMinutes: Math.round(playMinutes),
    plays: events.length,
    uniqueTracks: new Set(events.map((event) => event.trackKey)).size,
    updatedAt: new Date().toISOString(),
    events,
  }
}

async function collectRecent(token: string) {
  const items: SpotifyPlayed[] = []
  let path = '/me/player/recently-played?limit=50'
  for (let page = 0; page < 6 && path; page += 1) {
    const payload = await spotifyGet<{ items: SpotifyPlayed[]; next: string | null }>(path, token)
    items.push(...payload.items)
    if (!payload.next || payload.items.length === 0) break
    path = payload.next.replace('https://api.spotify.com/v1', '')
  }
  return { items }
}

function genresFor(names: string[], artists: SpotifyArtist[]) {
  const genres = names.flatMap((name) => artists.find((artist) => artist.name === name)?.genres ?? [])
  return genres.length ? genres.map(labelGenre) : ['Música']
}

function labelGenre(value: string) {
  const known = ['reggaeton', 'pop', 'rock', 'latin', 'r&b']
  const hit = known.find((genre) => value.toLowerCase().includes(genre))
  if (hit === 'reggaeton') return 'Reggaetón'
  if (hit === 'r&b') return 'R&B'
  if (!hit) return value.replace(/\b\w/g, (char) => char.toUpperCase())
  return hit[0].toUpperCase() + hit.slice(1)
}

export function catalogArtistId(name: string) {
  const key = name.toLowerCase()
  try {
    const all = ['quevedo', 'bad-bunny', 'feid', 'rosalia', 'taylor', 'weeknd', 'arctic', 'dua', 'bizarrap', 'karol', 'rauw', 'aitana', 'billie', 'dragons', 'coldplay']
    return all.find((id) => artistById(id).name.toLowerCase() === key) ?? null
  } catch {
    return null
  }
}
