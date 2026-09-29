import { MISSIONS } from '../data/meta'
import { formatNum } from '../domain/format'
import { useGame } from '../state/store'
import { Button, Meter, PageHead } from '../components/ui'

export function MissionsPage() {
  const game = useGame()
  return (
    <div className="grid gap-4">
      <PageHead kicker="Hoy y esta semana" title="Misiones" text="Entra, juega, gana un duelo y la racha no se enfría." />
      {(['daily', 'weekly'] as const).map((cadence) => (
        <section key={cadence} className="grid gap-2">
          <h2 className="font-display text-2xl">{cadence === 'daily' ? 'Diarias' : 'Semanales'}</h2>
          {MISSIONS.filter((mission) => mission.cadence === cadence).map((mission) => {
            const value = game.missionProgress(mission.cadence, mission.metric)
            const claimed = game.missionClaimed(mission.id, mission.cadence)
            const ready = value >= mission.target && !claimed
            return (
              <article key={mission.id} className="rounded-[28px] bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{mission.title}</h3>
                  <span className="text-xs text-spotify">+{formatNum(mission.xp)} XP · {formatNum(mission.coins)} Beats</span>
                </div>
                <div className="mt-3">
                  <Meter value={value / mission.target} />
                  <p className="mt-1 text-xs text-faint num">{Math.min(value, mission.target)} / {mission.target}</p>
                </div>
                <div className="mt-3">
                  {claimed ? <p className="text-sm text-spotify">Recompensa recogida</p> : <Button disabled={!ready} onClick={() => game.claimMission(mission.id)}>Recoger</Button>}
                </div>
              </article>
            )
          })}
        </section>
      ))}
    </div>
  )
}
