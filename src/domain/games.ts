import { ARTISTS, TRACKS, artistById, trackById, tracksByArtist } from '../data/catalog'
import { PEOPLE } from '../data/people'
import { formatCompact, formatDate } from './format'
import type { GameMode, Person, Question } from '../types'

const MIX: GameMode[] = ['guess', 'lyric', 'plays', 'listeners', 'release', 'cover']
const BATTLE: GameMode[] = ['guess', 'plays', 'release', 'cover', 'lyric']

export function makeRng(seed = Date.now()) {
  let state = seed % 2147483647
  if (state <= 0) state += 2147483646
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

function shuffle<T>(items: T[], rng: () => number) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1))
    const current = copy[index]
    copy[index] = copy[swap]
    copy[swap] = current
  }
  return copy
}

function pick<T>(items: T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)]
}

let sequence = 0

function optionTracks(correct: (typeof TRACKS)[number], rng: () => number, count = 3) {
  const rest = shuffle(
    TRACKS.filter((track) => track.id !== correct.id),
    rng,
  ).slice(0, count)
  return shuffle([correct, ...rest], rng)
}

export function nextQuestion(mode: GameMode, rng: () => number, circle: Person[], artistId?: string): Question {
  const focused = mode === 'duel' || mode === 'infinite' ? pick(MIX, rng) : mode === 'battle' ? pick(BATTLE, rng) : mode
  if (focused === 'guess') return guessQuestion(rng, artistId)
  if (focused === 'lyric') return lyricQuestion(rng, artistId)
  if (focused === 'plays') return playsQuestion(rng, artistId)
  if (focused === 'listeners') return listenersQuestion(rng, artistId)
  if (focused === 'release') return releaseQuestion(rng, artistId)
  if (focused === 'cover') return coverQuestion(rng, artistId)
  if (focused === 'who-listens') return whoListensQuestion(rng, circle)
  return whoseTopQuestion(rng, circle)
}

function guessQuestion(rng: () => number, artistId?: string): Question {
  const pool = artistId ? tracksByArtist(artistId) : TRACKS
  const track = pick(pool.length ? pool : TRACKS, rng)
  const artist = artistById(track.artistId)
  const year = track.released.slice(0, 4)
  sequence += 1
  return {
    id: `guess-${sequence}`,
    prompt: '¿Qué canción está sonando?',
    detail: 'Cinco segundos de pista. Después, la rapidez suma puntos.',
    visual: {
      type: 'listen',
      trackId: track.id,
      clues: [artist.genre, year, `Empieza por ${track.title.replace(/^[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9]+/, '')[0]?.toUpperCase() ?? '?'}`],
    },
    options: optionTracks(track, rng).map((item) => ({ id: item.id, label: item.title })),
    answerId: track.id,
    seconds: 12,
    fact: `${track.title} · ${artist.name} · ${year}`,
  }
}

const STOP_WORDS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'me', 'a', 'en', 'un', 'una', 'the', 'of', 'vol', 'i'])

function titleWords(title: string) {
  return (title.match(/[0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ'-]+/g) ?? []).filter((word) => word.length >= 3 && !STOP_WORDS.has(word.toLowerCase()))
}

function blankTitle(title: string) {
  const words = titleWords(title)
  if (words.length === 0) return null
  const unique = words.filter((word) => TRACKS.filter((track) => titleWords(track.title).some((item) => item.toLowerCase() === word.toLowerCase())).length === 1)
  const word = (unique.length ? unique : words).at(-1)
  if (!word) return null
  const at = title.lastIndexOf(word)
  if (at < 0) return null
  const before = title.slice(0, at).trim()
  const after = title.slice(at + word.length).trim()
  if (!before && !after) return null
  return { word, before, after }
}

function lyricQuestion(rng: () => number, artistId?: string): Question {
  const ready = TRACKS.map((track) => ({ track, blank: blankTitle(track.title) })).filter(
    (item): item is { track: (typeof TRACKS)[number]; blank: NonNullable<ReturnType<typeof blankTitle>> } => item.blank !== null,
  )
  const scoped = artistId ? ready.filter((item) => item.track.artistId === artistId) : ready
  const picked = pick(scoped.length ? scoped : ready, rng)
  const { track, blank } = picked
  const artist = artistById(track.artistId)
  const decoys = shuffle(
    [...new Map(TRACKS.flatMap((item) => titleWords(item.title)).filter((word) => word.toLowerCase() !== blank.word.toLowerCase()).map((word) => [word.toLowerCase(), word])).values()],
    rng,
  ).slice(0, 3)
  sequence += 1
  return {
    id: `lyric-${sequence}`,
    prompt: 'Completa el título',
    detail: `${artist.name}. La palabra que falta es la del tema real.`,
    visual: { type: 'lyric', before: blank.before, after: blank.after, trackId: track.id },
    options: shuffle([blank.word, ...decoys], rng).map((word) => ({ id: word, label: word })),
    answerId: blank.word,
    seconds: 14,
    fact: `${track.title} · ${artist.name}`,
  }
}

function playsQuestion(rng: () => number, artistId?: string): Question {
  const pool = artistId ? tracksByArtist(artistId) : TRACKS
  const left = pick(pool.length ? pool : TRACKS, rng)
  const right = pick(
    TRACKS.filter((track) => track.id !== left.id),
    rng,
  )
  const winner = left.plays >= right.plays ? left : right
  sequence += 1
  return {
    id: `plays-${sequence}`,
    prompt: '¿Cuál tiene más reproducciones?',
    visual: { type: 'versus', left: left.id, right: right.id, kind: 'track' },
    options: shuffle([left, right], rng).map((track) => ({
      id: track.id,
      label: track.title,
      sub: artistById(track.artistId).name,
    })),
    answerId: winner.id,
    seconds: 10,
    fact: `${formatCompact(left.plays)} frente a ${formatCompact(right.plays)} en el catálogo de liga.`,
  }
}

function listenersQuestion(rng: () => number, artistId?: string): Question {
  const pool = artistId ? ARTISTS.filter((artist) => artist.id !== artistId) : ARTISTS
  const focus = artistId ? artistById(artistId) : pick(ARTISTS, rng)
  const other = pick(pool.filter((artist) => artist.id !== focus.id), rng)
  const pair = artistId ? [focus, other] : shuffle([focus, other], rng).slice(0, 2)
  const [left, right] = pair.length === 2 ? pair : [focus, other]
  const winner = left.monthlyListeners >= right.monthlyListeners ? left : right
  sequence += 1
  return {
    id: `listeners-${sequence}`,
    prompt: '¿Quién tiene más oyentes mensuales?',
    visual: { type: 'versus', left: left.id, right: right.id, kind: 'artist' },
    options: shuffle([left, right], rng).map((artist) => ({ id: artist.id, label: artist.name, sub: artist.genre })),
    answerId: winner.id,
    seconds: 10,
    fact: `${formatCompact(left.monthlyListeners)} frente a ${formatCompact(right.monthlyListeners)} oyentes.`,
  }
}

function releaseQuestion(rng: () => number, artistId?: string): Question {
  const pool = artistId ? tracksByArtist(artistId) : TRACKS
  const left = pick(pool.length > 1 ? pool : TRACKS, rng)
  const right = pick(
    (artistId ? TRACKS : TRACKS).filter((track) => track.id !== left.id && track.released !== left.released),
    rng,
  )
  const winner = left.released <= right.released ? left : right
  sequence += 1
  return {
    id: `release-${sequence}`,
    prompt: '¿Qué canción salió antes?',
    visual: { type: 'versus', left: left.id, right: right.id, kind: 'track' },
    options: shuffle([left, right], rng).map((track) => ({
      id: track.id,
      label: track.title,
      sub: artistById(track.artistId).name,
    })),
    answerId: winner.id,
    seconds: 12,
    fact: `${trackById(winner.id).title} salió el ${formatDate(winner.released)}.`,
  }
}

function coverQuestion(rng: () => number, artistId?: string): Question {
  const pool = artistId ? tracksByArtist(artistId) : TRACKS
  const track = pick(pool.length ? pool : TRACKS, rng)
  const decoys = shuffle(
    TRACKS.filter((item) => item.album !== track.album),
    rng,
  ).slice(0, 3)
  sequence += 1
  return {
    id: `cover-${sequence}`,
    prompt: '¿De qué álbum es esta portada?',
    detail: 'La carátula de liga está desenfocada. Quien colecciona, reconoce.',
    visual: { type: 'cover', trackId: track.id },
    options: shuffle([track, ...decoys], rng).map((item) => ({
      id: item.id,
      label: item.album,
      sub: artistById(item.artistId).name,
    })),
    answerId: track.id,
    seconds: 12,
    fact: `${track.album} · ${track.title}`,
  }
}

function whoListensQuestion(rng: () => number, circle: Person[]): Question {
  const people = circle.length >= 2 ? circle : PEOPLE
  const artist = pick(ARTISTS, rng)
  const ranked = people
    .map((person) => ({
      person,
      minutes: person.listening.find((row) => row.artistId === artist.id)?.minutes ?? 0,
    }))
    .sort((a, b) => b.minutes - a.minutes)
  const contenders = ranked.filter((row) => row.minutes > 0).slice(0, 4)
  const board = contenders.length >= 2 ? contenders : ranked.slice(0, 4)
  const winner = board[0]
  sequence += 1
  return {
    id: `who-${sequence}`,
    prompt: `¿Quién escucha más a ${artist.name}?`,
    detail: 'Minutos reales de tu círculo.',
    visual: { type: 'plain', kicker: artist.genre },
    options: shuffle(board, rng).map((row) => ({ id: row.person.id, label: row.person.name, sub: row.person.handle })),
    answerId: winner.person.id,
    seconds: 12,
    fact: `${winner.person.name} acumula ${winner.minutes} min de ${artist.name}.`,
  }
}

function whoseTopQuestion(rng: () => number, circle: Person[]): Question {
  const people = shuffle(
    (circle.length >= 2 ? circle : PEOPLE).filter((person) => person.topTrackIds.length >= 4),
    rng,
  ).slice(0, 4)
  const subject = people[0] ?? PEOPLE[0]
  sequence += 1
  return {
    id: `top-${sequence}`,
    prompt: '¿De quién es este top 5?',
    detail: 'Canciones reales de alguien de la liga.',
    visual: { type: 'top5', trackIds: subject.topTrackIds.slice(0, 5) },
    options: shuffle(people, rng).map((person) => ({ id: person.id, label: person.name, sub: person.handle })),
    answerId: subject.id,
    seconds: 14,
    fact: `El top es de ${subject.name}.`,
  }
}

export function buildRound(mode: GameMode, count: number, rng: () => number, circle: Person[], artistId?: string) {
  const questions: Question[] = []
  const seen = new Set<string>()
  let guard = 0
  while (questions.length < count && guard < count * 8) {
    guard += 1
    const question = nextQuestion(mode, rng, circle, artistId)
    if (seen.has(question.prompt + question.answerId)) continue
    seen.add(question.prompt + question.answerId)
    questions.push(question)
  }
  return questions
}

export function pointsFor(correct: boolean, left: number, total: number, streak: number) {
  if (!correct) return 0
  const speed = Math.round((Math.max(left, 0) / total) * 80)
  return 100 + speed + Math.min(streak, 8) * 12
}
