import { ARTISTS, artistById } from '../data/catalog'
import type { ListeningSnapshot } from '../types'

export type Throne = {
  id: string
  title: string
  kind: 'artist' | 'genre'
  holderId: string
  holderName: string
  score: number
  runnerId: string
  runnerName: string
  runnerScore: number
  gapRatio: number
}

type Seat = { personId: string; name: string; snapshot: ListeningSnapshot }

const GENRE_TITLES: Record<string, string> = {
  Reggaetón: 'Rey del Reggaetón',
  Pop: 'Rey del Pop',
  Rock: 'Rey del Rock',
  Latin: 'Rey del Latin',
  'R&B': 'Rey del R&B',
  'Flamenco pop': 'Rey del Flamenco pop',
}

function scoreOf(snapshot: ListeningSnapshot, artistName: string) {
  const key = artistName.toLowerCase()
  return snapshot.topArtists.find((artist) => artist.name.toLowerCase() === key)?.minutes ?? 0
}

function genreScore(snapshot: ListeningSnapshot, genre: string) {
  const names = new Set(
    ARTISTS.filter((artist) => artist.genre === genre || (genre === 'Pop' && artist.genreGroup === 'pop') || (genre === 'Rock' && artist.genreGroup === 'rock') || (genre === 'Reggaetón' && artist.genreGroup === 'reggaeton')).map((artist) => artist.name.toLowerCase()),
  )
  return snapshot.topArtists.reduce((sum, artist) => (names.has(artist.name.toLowerCase()) ? sum + artist.minutes : sum), 0)
}

function rank(seats: Seat[], read: (snapshot: ListeningSnapshot) => number): { holder: Seat; score: number; runner: Seat; runnerScore: number } | null {
  const scored = seats
    .map((seat) => ({ seat, score: read(seat.snapshot) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
  if (scored.length < 2) return null
  return {
    holder: scored[0].seat,
    score: scored[0].score,
    runner: scored[1].seat,
    runnerScore: scored[1].score,
  }
}

export function buildThrones(seats: Seat[]): Throne[] {
  const thrones: Throne[] = []
  for (const artist of ARTISTS) {
    const row = rank(seats, (snapshot) => scoreOf(snapshot, artist.name))
    if (!row || row.score < 150) continue
    thrones.push({
      id: `artist:${artist.id}`,
      title: `Rey de ${artist.name}`,
      kind: 'artist',
      holderId: row.holder.personId,
      holderName: row.holder.name,
      score: row.score,
      runnerId: row.runner.personId,
      runnerName: row.runner.name,
      runnerScore: row.runnerScore,
      gapRatio: row.runnerScore / row.score,
    })
  }
  for (const genre of ['Reggaetón', 'Pop', 'Rock']) {
    const row = rank(seats, (snapshot) => genreScore(snapshot, genre))
    if (!row) continue
    thrones.push({
      id: `genre:${genre}`,
      title: GENRE_TITLES[genre],
      kind: 'genre',
      holderId: row.holder.personId,
      holderName: row.holder.name,
      score: row.score,
      runnerId: row.runner.personId,
      runnerName: row.runner.name,
      runnerScore: row.runnerScore,
      gapRatio: row.runnerScore / row.score,
    })
  }
  return thrones.sort((a, b) => b.score - a.score)
}

export function throneThreats(thrones: Throne[], meId: string) {
  return thrones.filter((throne) => throne.holderId === meId && throne.gapRatio >= 0.9)
}

export function artistIdFromThrone(throne: Throne) {
  if (throne.kind !== 'artist') return null
  return throne.id.replace('artist:', '')
}

export function dominance(score: number, leader: number) {
  if (leader <= 0) return 0
  const ratio = Math.min(1, score / leader)
  return Math.max(1, Math.round(58 * ratio ** 0.72))
}

export function threatLine(throne: Throne) {
  const subject = throne.title.replace(/^Rey del /, '').replace(/^Rey de /, '')
  return `${throne.runnerName} está a punto de quitarte el trono de ${subject}.`
}

export function throneAccent(throne: Throne) {
  if (throne.kind === 'genre') return ['#E7C36A', '#3A2C10'] as [string, string]
  const id = throne.id.replace('artist:', '')
  return artistById(id).palette
}
