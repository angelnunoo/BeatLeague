import { ACHIEVEMENTS } from '../data/meta'
import { formatNum } from '../domain/format'
import { useGame } from '../state/store'
import { Meter, PageHead } from '../components/ui'

export function AchievementsPage() {
  const game = useGame()
  return (
    <div className="grid gap-3">
      <PageHead kicker="Colección" title="Logros" text="Rachas, duelos, tronos y canciones. Cada uno deja XP y Beats cuando lo cruzas en partida." />
      {ACHIEVEMENTS.map((item) => {
        const value = game.achievementValue(item.metric)
        const done = value >= item.target
        return (
          <article key={item.id} className={`rounded-[28px] border p-4 ${done ? 'border-spotify/40 bg-spotify/10' : 'border-white/8 bg-panel'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-muted">{item.detail}</p>
              </div>
              <p className="text-xs text-spotify">+{formatNum(item.xp)} XP</p>
            </div>
            <div className="mt-3">
              <Meter value={value / item.target} gold={done} />
              <p className="mt-1 text-xs text-faint num">{Math.min(value, item.target)} / {item.target}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
