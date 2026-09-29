import type { ListeningSnapshot } from '../types'

function norm(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

function overlap(a: string[], b: string[]) {
  const left = new Map(a.map((item) => [norm(item), item]))
  const right = new Set(b.map((item) => norm(item)))
  const shared = [...left.entries()].filter(([key]) => right.has(key)).map(([, label]) => label)
  const union = new Set([...left.keys(), ...right])
  const minSize = Math.min(left.size, right.size) || 1
  return {
    shared,
    jaccard: union.size ? shared.length / union.size : 0,
    coverage: shared.length / minSize,
  }
}

export type CompatReport = {
  percent: number
  sharedArtists: string[]
  sharedGenres: string[]
  sharedTracks: string[]
  youMinutes: number
  themMinutes: number
}

export function compatibility(you: ListeningSnapshot, them: ListeningSnapshot): CompatReport {
  const artists = overlap(
    you.topArtists.map((artist) => artist.name),
    them.topArtists.map((artist) => artist.name),
  )
  const genres = overlap(
    you.genres.map((genre) => genre.name),
    them.genres.map((genre) => genre.name),
  )
  const tracks = overlap(
    you.topTracks.map((track) => track.name),
    them.topTracks.map((track) => track.name),
  )
  const sameCrown = norm(you.topArtists[0]?.name ?? '') === norm(them.topArtists[0]?.name ?? '')
  const raw = artists.coverage * 0.62 + genres.coverage * 0.18 + tracks.coverage * 0.2 + (sameCrown ? 0.05 : 0)
  const percent = Math.max(8, Math.min(99, Math.round(raw * 100)))
  return {
    percent,
    sharedArtists: artists.shared,
    sharedGenres: genres.shared,
    sharedTracks: tracks.shared,
    youMinutes: you.listeningMinutes,
    themMinutes: them.listeningMinutes,
  }
}
