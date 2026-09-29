import { artistById, trackById } from '../data/catalog'
import { LAST_PREDICTION, PREDICTIONS } from '../data/meta'
import { formatNum } from '../domain/format'
import { useGame } from '../state/store'
import { Button, PageHead, Panel } from '../components/ui'

export function PredictPage() {
  const game = useGame()
  return (
    <div className="grid gap-4">
      <PageHead kicker="Mercado" title="Predice el hit" text="Acierta el crecimiento y la liga paga en XP y Beats cuando cierra la semana." />
      {PREDICTIONS.map((item) => (
        <Panel key={item.id}>
          <h2 className="font-display text-2xl leading-tight">{item.title}</h2>
          <div className="mt-3 grid gap-2">
            {item.options.map((option) => {
              const label = item.kind === 'artist' ? artistById(option).name : trackById(option).title
              const picked = game.state.predictions[item.id] === option
              return (
                <button key={option} type="button" onClick={() => game.predict(item.id, option)} className={`rounded-2xl px-3 py-3 text-left text-sm ${picked ? 'bg-spotify text-black' : 'bg-white/6'}`}>
                  {label}
                </button>
              )
            })}
          </div>
        </Panel>
      ))}
      <Panel>
        <p className="text-xs font-semibold tracking-[0.16em] text-gold uppercase">Cerrada</p>
        <h2 className="mt-2 font-display text-2xl">{LAST_PREDICTION.title}</h2>
        <p className="mt-2 text-sm text-muted">Resultado: {LAST_PREDICTION.correctLabel}. Premio de participación: {formatNum(LAST_PREDICTION.xp)} XP y {formatNum(LAST_PREDICTION.coins)} Beats.</p>
        <Button className="mt-3" disabled={game.state.claimedPrediction} onClick={game.claimPrediction}>
          {game.state.claimedPrediction ? 'Premio recogido' : 'Recoger premio'}
        </Button>
      </Panel>
    </div>
  )
}
