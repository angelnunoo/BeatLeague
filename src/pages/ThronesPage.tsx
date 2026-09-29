import { formatMinutes } from '../domain/format'
import { THRONE_DAYS, THRONE_HISTORY } from '../domain/retention'
import { dominance, threatLine, throneAccent } from '../domain/thrones'
import { useGame } from '../state/store'
import { Meter, PageHead, Panel } from '../components/ui'

export function ThronesPage() {
  const game = useGame()
  return (
    <div className="grid gap-3">
      <PageHead kicker="Guerras de tronos" title="Tronos" text="La corona no se compra. Se escucha, se defiende y se pierde si alguien se te pega." />
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Defensas" value={String(game.state.throneDefenses)} />
        <Stat label="Récord" value={`${game.state.throneRecordDays} d`} />
        <Stat label="Tus coronas" value={String(game.myThrones.length)} />
      </div>
      {game.threats.map((throne) => {
        const mine = dominance(throne.score, throne.score)
        const rival = dominance(throne.runnerScore, throne.score)
        return (
          <Panel key={`alert-${throne.id}`} className="border-gold/40">
            <p className="font-semibold text-gold">{threatLine(throne)}</p>
            <p className="mt-1 text-sm text-muted">{throne.runnerName} está a un {mine - rival}% de arrebatártelo.</p>
          </Panel>
        )
      })}
      {game.thrones.map((throne) => {
        const mine = throne.holderId === 'angel'
        const accent = throneAccent(throne)
        const holderPct = dominance(throne.score, throne.score)
        const runnerPct = dominance(throne.runnerScore, throne.score)
        const days = THRONE_DAYS[throne.id] ?? 1
        return (
          <article key={throne.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-panel">
            <div className="h-2" style={{ background: `linear-gradient(90deg, ${accent[0]}, transparent)` }} />
            <div className="p-4">
              <p className="text-xs text-faint">{throne.kind === 'artist' ? 'Artista' : 'Género'} · {days} {days === 1 ? 'día' : 'días'} en el trono</p>
              <h2 className="font-display text-3xl leading-none">👑 {throne.title}</h2>
              <div className="mt-4 grid gap-3">
                <Row name={mine ? 'Tú' : throne.holderName} percent={holderPct} />
                <Row name={throne.runnerName} percent={runnerPct} />
              </div>
              <p className="mt-3 text-sm text-muted">{formatMinutes(throne.score)} frente a {formatMinutes(throne.runnerScore)}</p>
            </div>
          </article>
        )
      })}
      <Panel>
        <h2 className="font-display text-2xl">Historial de la guerra</h2>
        <ul className="mt-3 grid gap-2 text-sm">
          {THRONE_HISTORY.map((entry) => (
            <li key={entry.text} className="flex justify-between gap-3">
              <span>{entry.text}</span>
              <span className="shrink-0 text-faint">{entry.ago}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function Row({ name, percent }: { name: string; percent: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{name}</span>
        <span className="num">{percent}%</span>
      </div>
      <Meter value={percent / 58} gold={percent >= 58} />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/5 px-3 py-3">
      <p className="text-xs text-faint">{label}</p>
      <p className="mt-1 font-display text-2xl leading-none">{value}</p>
    </div>
  )
}
