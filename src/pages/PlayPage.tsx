import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { playCue, vibrate } from '../audio'
import { ARTISTS, artistById, trackById } from '../data/catalog'
import { GAMES } from '../data/meta'
import { PEOPLE } from '../data/people'
import { buildRound, makeRng, nextQuestion, pointsFor } from '../domain/games'
import { formatNum } from '../domain/format'
import { RARITY_LABEL } from '../domain/progression'
import { useGame } from '../state/store'
import type { GameMode, MatchReward, Question } from '../types'
import { Button, CoverArt, Mark, PageHead, Stars, Wave } from '../components/ui'

const MODES = new Set<string>(GAMES.map((game) => game.id))
const COUNTS: Record<GameMode, number> = {
  guess: 6,
  lyric: 6,
  plays: 6,
  listeners: 6,
  release: 6,
  cover: 6,
  'who-listens': 5,
  'whose-top': 5,
  duel: 10,
  infinite: 1,
  battle: 8,
}

export function PlayPage() {
  const { mode: raw = '' } = useParams()
  const [params] = useSearchParams()
  const game = useGame()
  if (!MODES.has(raw)) return <PageHead kicker="Juego" title="Ese modo no existe" />
  const mode = raw as GameMode
  const artistId = params.get('artist') ?? undefined
  const rivalId = params.get('rival') ?? undefined
  const meta = GAMES.find((item) => item.id === mode)
  if (mode === 'battle' && !artistId) {
    return (
      <div>
        <PageHead kicker="Batalla" title="Elige el artista" text="Todas las preguntas giran alrededor de esa corona." />
        <div className="grid grid-cols-2 gap-2">
          {ARTISTS.map((artist) => (
            <Link key={artist.id} to={`/jugar/battle?artist=${artist.id}`} className="rounded-3xl bg-white/5 p-3">
              <Mark name={artist.name} palette={artist.palette} size={42} />
              <p className="mt-2 font-semibold">{artist.name}</p>
              <p className="text-xs text-faint">{artist.genre}</p>
            </Link>
          ))}
        </div>
      </div>
    )
  }
  if (mode === 'duel' && !rivalId) {
    return (
      <div>
        <PageHead kicker="Duelo" title="Elige rival" text="Diez preguntas. El reloj también puntúa." />
        <div className="grid gap-2">
          {game.friends.map((person) => (
            <Link key={person.id} to={`/jugar/duel?rival=${person.id}`} className="flex items-center gap-3 rounded-3xl bg-white/5 p-3">
              <Mark name={person.name} palette={person.palette} size={42} />
              <span className="font-semibold">{person.name}</span>
              <span className="ml-auto text-sm text-muted">Nivel {person.level}</span>
            </Link>
          ))}
        </div>
      </div>
    )
  }
  return <Session key={`${mode}-${artistId ?? ''}-${rivalId ?? ''}`} mode={mode} title={meta?.name ?? 'Partida'} artistId={artistId} rivalId={rivalId} />
}

function Session({ mode, title, artistId, rivalId }: { mode: GameMode; title: string; artistId?: string; rivalId?: string }) {
  const game = useGame()
  const rival = PEOPLE.find((person) => person.id === rivalId)
  const rng = useRef(makeRng())
  const [started, setStarted] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'listen' | 'play' | 'feedback' | 'level' | 'result'>('play')
  const [timeLeft, setTimeLeft] = useState(12)
  const [listenLeft, setListenLeft] = useState(5)
  const [clues, setClues] = useState(0)
  const [selected, setSelected] = useState('')
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [best, setBest] = useState(0)
  const [rivalScores, setRivalScores] = useState<number[]>([])
  const [reward, setReward] = useState<MatchReward | null>(null)
  const lock = useRef(false)
  const done = useRef(false)
  const scoreRef = useRef(0)
  const correctRef = useRef(0)
  const bestRef = useRef(0)
  const timeRef = useRef(12)
  const pending = useRef(0)
  const question = questions[index]
  timeRef.current = timeLeft

  useEffect(() => () => window.clearTimeout(pending.current), [])

  function begin() {
    const circle = [game.me, ...game.friends]
    const round = buildRound(mode, COUNTS[mode], rng.current, circle, artistId)
    const beats = rival ? round.map((item) => (rng.current() < Math.min(0.84, 0.4 + rival.level / 110) ? pointsFor(true, item.seconds * 0.5, item.seconds, 2) : 0)) : []
    setQuestions(round)
    setRivalScores(beats)
    setIndex(0)
    setScore(0)
    setStreak(0)
    setCorrect(0)
    setBest(0)
    scoreRef.current = 0
    correctRef.current = 0
    bestRef.current = 0
    done.current = false
    lock.current = false
    setStarted(true)
    open(round[0])
  }

  function open(item: Question | undefined) {
    if (!item) return
    setSelected('')
    lock.current = false
    if (item.visual.type === 'listen') {
      setPhase('listen')
      setListenLeft(5)
      setClues(1)
      setTimeLeft(item.seconds)
      return
    }
    setPhase('play')
    setTimeLeft(item.seconds)
  }

  function finish(answered: number) {
    if (done.current) return
    done.current = true
    const rivalTotal = rivalScores.reduce((sum, value) => sum + value, 0)
    const won = mode === 'duel' ? scoreRef.current > rivalTotal : mode === 'infinite' ? bestRef.current >= 5 : answered > 0 && correctRef.current / answered >= 0.6
    const summary = game.finishMatch({
      mode,
      score: scoreRef.current,
      correct: correctRef.current,
      total: answered,
      bestStreak: bestRef.current,
      won,
      artistId,
    })
    setReward(summary)
    setPhase(summary.leveledUp ? 'level' : 'result')
    void playCue(summary.leveledUp ? 'level' : won ? 'win' : 'bad', game.state.sound)
    vibrate(won ? [12, 30, 12] : 30, game.state.haptics)
  }

  function advance(hit: boolean, from: number, total: number) {
    if (mode === 'infinite') {
      if (!hit) {
        finish(from + 1)
        return
      }
      const extra = nextQuestion('infinite', rng.current, [game.me, ...game.friends], artistId)
      setQuestions((current) => [...current, extra])
      setIndex(from + 1)
      open(extra)
      return
    }
    if (from + 1 >= total) {
      finish(total)
      return
    }
    const upcoming = questions[from + 1]
    setIndex(from + 1)
    open(upcoming)
  }

  function choose(optionId: string) {
    if (!question || lock.current || phase === 'feedback' || phase === 'listen') return
    lock.current = true
    const hit = optionId === question.answerId
    const nextStreak = hit ? streak + 1 : 0
    const gained = pointsFor(hit, timeRef.current, question.seconds, streak)
    scoreRef.current += gained
    if (hit) correctRef.current += 1
    bestRef.current = Math.max(bestRef.current, nextStreak)
    setSelected(optionId)
    setScore(scoreRef.current)
    setStreak(nextStreak)
    setBest(bestRef.current)
    setCorrect(correctRef.current)
    setPhase('feedback')
    void playCue(hit ? 'ok' : 'bad', game.state.sound)
    vibrate(hit ? 10 : [16, 30, 16], game.state.haptics)
    const from = index
    const total = questions.length
    window.clearTimeout(pending.current)
    pending.current = window.setTimeout(() => advance(hit, from, total), 850)
  }

  useEffect(() => {
    if (!started || phase !== 'listen') return
    const startedAt = Date.now()
    const timer = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000
      setListenLeft(Math.max(0, 5 - elapsed))
      setClues(elapsed > 3.3 ? 3 : elapsed > 1.6 ? 2 : 1)
      if (elapsed >= 5) {
        window.clearInterval(timer)
        setPhase('play')
      }
    }, 80)
    return () => window.clearInterval(timer)
  }, [started, phase, index])

  useEffect(() => {
    if (!started || phase !== 'play' || !question) return
    const startedAt = Date.now()
    const total = question.seconds
    const timer = window.setInterval(() => {
      const left = total - (Date.now() - startedAt) / 1000
      if (left <= 0) {
        window.clearInterval(timer)
        timeRef.current = 0
        choose('')
      } else {
        timeRef.current = left
        setTimeLeft(left)
      }
    }, 80)
    return () => window.clearInterval(timer)
  }, [started, phase, index, question])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const digit = Number(event.key)
      if (!question || digit < 1 || digit > question.options.length) return
      choose(question.options[digit - 1]?.id ?? '')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!started) {
    return (
      <div className="grid gap-4">
        <PageHead kicker="Partida" title={title} text={introCopy(mode, rival?.name, artistId)} />
        <Button full onClick={begin}>Empezar</Button>
        <Link to="/juegos" className="text-center text-sm text-muted">Volver a juegos</Link>
      </div>
    )
  }

  if (phase === 'level' && reward) {
    return (
      <div className="grid min-h-[70dvh] place-items-center text-center">
        <div className="pop">
          <p className="text-xs font-semibold tracking-[0.2em] text-spotify uppercase">Subida de nivel</p>
          <p className="mt-3 font-display text-8xl">{reward.level}</p>
          <p className="mt-2 text-muted">La liga acaba de moverse.</p>
          <Button className="mt-6" onClick={() => setPhase('result')}>Ver recompensa</Button>
        </div>
      </div>
    )
  }

  if (phase === 'result' && reward) {
    const rivalTotal = rivalScores.reduce((sum, value) => sum + value, 0)
    const won = mode === 'duel' ? score > rivalTotal : mode === 'infinite' ? best >= 5 : questions.length > 0 && correct / Math.max(questions.length, 1) >= 0.6
    return (
      <div className={`grid gap-4 ${won ? '' : 'shake'}`}>
        <section className={`overflow-hidden rounded-[32px] p-6 ${won ? 'bg-[radial-gradient(circle_at_top,rgba(29,185,84,0.4),transparent_46%),#142418]' : 'bg-[radial-gradient(circle_at_top,rgba(255,90,122,0.28),transparent_46%),#241418]'}`}>
          <p className="text-xs font-semibold tracking-[0.18em] uppercase">{won ? 'Victoria' : 'Derrota'}</p>
          <h1 className="mt-2 font-display text-6xl leading-none">{formatNum(score)}</h1>
          <p className="mt-2 text-sm text-muted">{correct} aciertos · racha {best}{mode === 'duel' && rival ? ` · ${rival.name} ${formatNum(rivalTotal)}` : ''}</p>
          <div className="mt-4 flex gap-2">
            <span className="rounded-full bg-black/30 px-3 py-1 text-sm">+{formatNum(reward.xp)} XP{reward.multiplier > 1 ? ` · x${reward.multiplier.toLocaleString('es-ES')}` : ''}</span>
            <span className="rounded-full bg-black/30 px-3 py-1 text-sm">+{formatNum(reward.coins)} Beats</span>
          </div>
        </section>
        {reward.card ? (
          <div className="rounded-[28px] border border-gold/40 bg-gold/10 p-4">
            <Stars rarity={reward.card.rarity} />
            <p className="mt-2 font-display text-3xl">Carta {RARITY_LABEL[reward.card.rarity]}</p>
            <p className="text-sm text-muted">{artistById(reward.card.artistId).name} entra en la colección.</p>
          </div>
        ) : null}
        {reward.throneAlert ? <p className="text-sm text-gold">{reward.throneAlert}</p> : null}
        <Button full onClick={begin}>Jugar otra</Button>
        <Link to="/liga" className="text-center text-sm text-spotify">Ver cómo queda la liga</Link>
      </div>
    )
  }

  if (!question) return null
  const ratio = phase === 'listen' ? listenLeft / 5 : timeLeft / question.seconds

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{title}</span>
        <span className="num">{mode === 'infinite' ? `Racha ${streak}` : `${index + 1}/${questions.length}`}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="bar-fill h-full bg-spotify" style={{ width: `${Math.max(0, ratio) * 100}%` }} />
      </div>
      <section className="rounded-[32px] border border-white/10 bg-panel p-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-spotify uppercase">{phase === 'listen' ? 'Escucha' : 'Responde'}</p>
        <h1 className="mt-2 font-display text-4xl leading-none">{question.prompt}</h1>
        {question.detail ? <p className="mt-2 text-sm text-muted">{question.detail}</p> : null}
        <Visual question={question} clues={clues} live={phase === 'listen'} />
      </section>
      <div className="grid gap-2">
        {phase === 'listen' ? (
          <p className="text-center text-sm text-muted">Las respuestas se abren en <span className="num text-white">{Math.ceil(listenLeft)}</span> s</p>
        ) : (
          question.options.map((option, optionIndex) => {
            const show = phase === 'feedback'
            const right = option.id === question.answerId
            const picked = option.id === selected
            const look = show && right ? 'border-spotify bg-spotify/15' : show && picked ? 'border-danger bg-danger/10' : 'border-white/10 bg-white/5'
            return (
              <button key={option.id} type="button" disabled={phase !== 'play'} onClick={() => choose(option.id)} className={`rounded-[22px] border px-4 py-3 text-left ${look}`}>
                <span className="mr-2 text-faint">{optionIndex + 1}</span>
                <span className="font-semibold">{option.label}</span>
                {option.sub ? <span className="mt-1 block text-xs text-muted">{option.sub}</span> : null}
              </button>
            )
          })
        )}
      </div>
      {phase === 'feedback' ? <p className="text-sm text-muted">{question.fact}</p> : null}
      <p className="text-center text-sm"><span className="num font-semibold">{formatNum(score)}</span> pts {streak > 1 ? `· racha x${streak}` : ''}</p>
    </div>
  )
}

function Visual({ question, clues, live }: { question: Question; clues: number; live: boolean }) {
  const visual = question.visual
  if (visual.type === 'listen') {
    return (
      <div className="mt-4">
        <Wave live={live} />
        <div className="mt-3 flex flex-wrap gap-2">
          {visual.clues.slice(0, clues).map((clue) => (
            <span key={clue} className="rounded-full bg-white/8 px-3 py-1 text-xs">{clue}</span>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">El tema es real. Esta pista es una referencia hasta que entre el audio de Spotify.</p>
      </div>
    )
  }
  if (visual.type === 'lyric') {
    return (
      <p className="mt-4 font-display text-3xl leading-tight">
        {visual.before} <span className="text-spotify">____</span> {visual.after}
      </p>
    )
  }
  if (visual.type === 'cover') return <CoverArt trackId={visual.trackId} blurred className="mx-auto mt-4 max-w-56" />
  if (visual.type === 'versus') {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        <VersusCard id={visual.left} kind={visual.kind} />
        <VersusCard id={visual.right} kind={visual.kind} />
      </div>
    )
  }
  if (visual.type === 'top5') {
    return (
      <ol className="mt-4 grid gap-2">
        {visual.trackIds.map((id, position) => {
          const track = trackById(id)
          return (
            <li key={id} className="flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2 text-sm">
              <span className="num text-spotify">{position + 1}</span>
              <span>{track.title}</span>
            </li>
          )
        })}
      </ol>
    )
  }
  return <p className="mt-4 text-sm text-gold">{visual.kicker}</p>
}

function VersusCard({ id, kind }: { id: string; kind: 'track' | 'artist' }) {
  if (kind === 'track') {
    const track = trackById(id)
    return (
      <div>
        <CoverArt trackId={id} />
        <p className="mt-2 text-sm font-semibold">{track.title}</p>
      </div>
    )
  }
  const artist = artistById(id)
  return (
    <div className="rounded-3xl bg-white/5 p-3">
      <Mark name={artist.name} palette={artist.palette} />
      <p className="mt-2 font-semibold">{artist.name}</p>
    </div>
  )
}

function introCopy(mode: GameMode, rival?: string, artistId?: string) {
  if (mode === 'duel') return `Contra ${rival ?? 'tu rival'}. Diez preguntas y puntos por rapidez.`
  if (mode === 'infinite') return 'Una falla corta la racha. El récord se guarda en tu perfil de juego.'
  if (mode === 'battle') return `Batalla ${artistById(artistId ?? 'quevedo').name}. Todo el set pertenece a ese artista.`
  if (mode === 'guess') return 'Cinco segundos de pista, luego cuatro títulos. Contestar pronto vale más.'
  if (mode === 'lyric') return 'Falta una palabra del título real. Las opciones también salen de temas que existen.'
  return 'Responde antes de que la barra llegue a cero.'
}
