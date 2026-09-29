import { Link } from 'react-router-dom'
import { GAMES, SHOP } from '../data/meta'
import { dayKey, formatMinutes, formatNum } from '../domain/format'
import { formatMultiplier, heuristicEngine, insightInputFromSnapshot, nextStreakTier, streakMultiplier } from '../domain/retention'
import { threatLine } from '../domain/thrones'
import { useGame } from '../state/store'
import { Chip, Mark, Meter, Panel } from '../components/ui'

export function HomePage() {
  const game = useGame()
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const threat = game.threats[0]
  const rival = [...game.friends].sort((a, b) => game.compat(b).percent - game.compat(a).percent)[0]
  const rivalCompat = rival ? game.compat(rival) : null
  const weekly = game.standings('weekly').find((row) => row.person.id === 'angel')
  const multiplier = streakMultiplier(game.me.streak)
  const nextTier = nextStreakTier(game.me.streak)
  const calendarOpen = game.state.lastClaim !== dayKey()
  const insight = heuristicEngine.recommend(
    insightInputFromSnapshot(game.snapshot, {
      threat: threat ? threatLine(threat) : undefined,
      friendName: rival?.name,
      compat: rivalCompat?.percent,
    }),
  )[0]

  return (
    <div className="grid gap-4">
      <section className="rise overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(29,185,84,0.28),transparent_36%),linear-gradient(180deg,#1a1a1a,#101010)] p-5">
        <p className="text-sm text-muted">{hello}</p>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative">
            <span className="pulse-ring absolute inset-0 rounded-full border border-spotify/50" />
            <Mark name={game.me.name} palette={game.me.palette} size={72} glow={game.state.equipped.effect === 'fx-glow'} ring={SHOP.find((item) => item.id === game.state.equipped.frame)?.palette?.[0]} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-4xl leading-none">{game.me.name}</h1>
            <p className="mt-1 text-sm text-muted">
              Nivel <span className="num text-white">{game.progress.level}</span> · <span className="num">{formatNum(game.me.xp)}</span> XP
            </p>
            <div className="mt-3">
              <Meter value={game.progress.ratio} />
              <p className="mt-1 text-xs text-faint">
                <span className="num">{formatNum(game.progress.into)}</span> / <span className="num">{formatNum(game.progress.need)}</span> para el siguiente nivel
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip tone="gold">👑 {game.myThrones[0]?.title ?? game.me.title}</Chip>
          <Chip tone="green">🔥 {game.me.streak} días · {formatMultiplier(multiplier)}</Chip>
          <Chip>🥇 #{weekly?.rank ?? 1} semanal</Chip>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <Link to="/juegos" className="min-w-0 rounded-[28px] bg-spotify p-4 text-black">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase">Jugar ahora</p>
          <p className="mt-2 font-display text-3xl leading-none">Entra en la liga</p>
          <p className="mt-2 text-sm">12 modos. La racha multiplica el XP.</p>
        </Link>
        <Link to={rival ? `/jugar/duel?rival=${rival.id}` : '/juegos'} className="min-w-0 rounded-[28px] border border-white/10 bg-panel p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Duelo</p>
          <p className="mt-2 font-display text-3xl leading-none">{rival?.name ?? 'Amigo'}</p>
          <p className="mt-2 text-sm text-muted">Compatibilidad {rivalCompat?.percent ?? 0}%</p>
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Link to="/calendario" className="rounded-[28px] border border-gold/30 bg-gold/10 p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-gold uppercase">Calendario</p>
          <p className="mt-2 font-display text-3xl leading-none">{calendarOpen ? `Día ${Math.min(30, game.state.calendarDay + 1)}` : 'Hoy cobrado'}</p>
          <p className="mt-2 text-sm text-muted">{calendarOpen ? 'La carta épica del día 7 está esperando.' : 'Vuelve mañana para no enfriar el fuego.'}</p>
        </Link>
        <Link to="/temporada" className="rounded-[28px] border border-white/10 bg-panel p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-spotify uppercase">Temporada 1</p>
          <p className="mt-2 font-display text-3xl leading-none">Reyes del Reggaetón</p>
          <p className="mt-2 text-sm text-muted">Beat Pass de 50 niveles. El histórico no se borra.</p>
        </Link>
      </div>

      <Panel className="border-spotify/30">
        <p className="text-xs font-semibold tracking-[0.16em] text-spotify uppercase">Fuego de racha</p>
        <p className="mt-2 text-lg font-semibold">{formatMultiplier(multiplier)} en cada partida</p>
        <p className="mt-1 text-sm text-muted">
          {nextTier
            ? `Faltan ${nextTier.at - game.me.streak} días para ${formatMultiplier(nextTier.multiplier)}. Si mañana no entras, el fuego se apaga y vuelves a x1.`
            : 'Estás en el tope. Perder mañana te devuelve a x1.'}
        </p>
      </Panel>

      <Link to="/estadisticas" className="block rounded-[28px] border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-spotify uppercase">Escucha que puntúa</p>
        <p className="mt-2 font-semibold">{formatNum(game.snapshot.uniqueTracks)} canciones · {formatNum(game.snapshot.plays)} reproducciones · {formatMinutes(game.snapshot.listeningMinutes)}</p>
        <p className="mt-1 text-sm text-muted">+{formatNum(game.state.ledger[game.state.provider].points)} puntos. Otra vez la misma canción también suma.</p>
      </Link>

      {insight ? (
        <Link to={insight.href} className="block rounded-[28px] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">IA musical</p>
          <p className="mt-2 font-semibold">{insight.title}</p>
          <p className="mt-1 text-sm text-muted">{insight.detail}</p>
        </Link>
      ) : null}

      {threat ? (
        <Panel className="border-gold/30 bg-gold/8">
          <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">Trono en peligro</p>
          <p className="mt-2 text-lg font-semibold">{threatLine(threat)}</p>
          <Link to="/tronos" className="mt-3 inline-block text-sm font-semibold text-gold">
            Ver la distancia
          </Link>
        </Panel>
      ) : null}

      {rival && rivalCompat ? (
        <Panel>
          <p className="text-xs font-semibold tracking-[0.16em] text-spotify uppercase">Compatibilidad máxima</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Mark name={rival.name} palette={rival.palette} />
              <div>
                <p className="font-semibold">{game.me.name} ♥ {rival.name}</p>
                <p className="text-sm text-muted">{rivalCompat.sharedArtists.slice(0, 3).join(' · ') || 'Gustos cruzados'}</p>
              </div>
            </div>
            <p className="font-display text-4xl text-spotify">{rivalCompat.percent}%</p>
          </div>
        </Panel>
      ) : null}

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-2xl">Misiones de hoy</h2>
          <Link to="/misiones" className="text-sm text-spotify">Ver todas</Link>
        </div>
        <div className="grid gap-2">
          <MissionRow label="Juega 3 partidas" value={game.missionProgress('daily', 'plays')} target={3} />
          <MissionRow label="Defiende un trono" value={game.missionProgress('daily', 'defenses')} target={1} />
          <MissionRow label="Acierta 15 preguntas" value={game.missionProgress('daily', 'correct')} target={15} />
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-2xl">Actividad del círculo</h2>
        <div className="grid gap-2">
          {game.friends.slice(0, 3).map((person) => (
            <Link key={person.id} to={`/perfil/${person.id}`} className="flex items-center gap-3 rounded-3xl bg-white/5 px-3 py-3">
              <Mark name={person.name} palette={person.palette} size={42} />
              <p className="text-sm">{person.activity[0]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-2xl">Modos calientes</h2>
          <Link to="/juegos" className="text-sm text-spotify">Biblioteca</Link>
        </div>
        <div className="hide-scroll flex gap-3 overflow-x-auto pb-1">
          {GAMES.slice(0, 4).map((item) => (
            <Link key={item.id} to={`/jugar/${item.id}`} className="w-52 shrink-0 rounded-[28px] border border-white/10 bg-panel p-4">
              <p className="font-semibold">{item.name}</p>
              <p className="mt-2 text-sm text-muted">{item.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <Link to="/wrapped" className="block rounded-[28px] border border-white/10 bg-[linear-gradient(120deg,#123524,#0f0f0f_55%,#2a2208)] p-5">
        <p className="text-xs font-semibold tracking-[0.16em] text-spotify uppercase">BeatLeague Wrapped</p>
        <p className="mt-2 font-display text-3xl">Tu semana, en una tarjeta</p>
        <p className="mt-2 text-sm text-muted">Artista, canción, escucha y puesto. Lista para compartir.</p>
        </Link>
    </div>
  )
}

function MissionRow({ label, value, target }: { label: string; value: number; target: number }) {
  return (
    <div className="rounded-3xl bg-white/5 px-4 py-3">
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span className="num text-muted">{Math.min(value, target)}/{target}</span>
      </div>
      <Meter value={value / target} />
    </div>
  )
}
