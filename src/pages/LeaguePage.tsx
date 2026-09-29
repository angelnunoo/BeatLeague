import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LEAGUE_META } from '../domain/leagues'
import { formatMinutes, formatNum } from '../domain/format'
import { useGame } from '../state/store'
import type { LeagueKind } from '../types'
import { Mark, PageHead } from '../components/ui'

export function LeaguePage() {
  const game = useGame()
  const [kind, setKind] = useState<LeagueKind>('weekly')
  const meta = LEAGUE_META.find((item) => item.id === kind) ?? LEAGUE_META[1]
  const rows = game.standings(kind)
  return (
    <div className="grid gap-4">
      <PageHead kicker="Clasificación" title={meta.label} text={meta.detail} />
      <div className="hide-scroll flex gap-2 overflow-x-auto">
        {LEAGUE_META.map((item) => (
          <button key={item.id} type="button" onClick={() => setKind(item.id)} className={`shrink-0 rounded-full px-3 py-2 text-sm ${item.id === kind ? 'bg-spotify text-black' : 'bg-white/8 text-muted'}`}>
            {item.label}
          </button>
        ))}
      </div>
      <ol className="grid gap-2">
        {rows.map((row) => {
          const mine = row.person.id === 'angel'
          const points = kind === 'musical' ? formatMinutes(row.points) : formatNum(row.points)
          const arrow = row.movement > 0 ? '▲' : row.movement < 0 ? '▼' : '•'
          const tone = row.movement > 0 ? 'text-spotify' : row.movement < 0 ? 'text-danger' : 'text-faint'
          return (
            <li key={row.person.id}>
              <Link to={mine ? '/perfil' : `/perfil/${row.person.id}`} className={`flex items-center gap-3 rounded-[24px] px-3 py-3 ${mine ? 'bg-spotify/12 ring-1 ring-spotify/40' : 'bg-white/5'}`}>
                <span className="num w-6 text-center font-display text-xl">{row.rank}</span>
                <Mark name={row.person.name} palette={row.person.palette} size={42} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{row.person.name}</span>
                  <span className={`text-xs ${tone}`}>{arrow} {Math.abs(row.movement)} {row.delta > 0 ? `· -${formatNum(row.delta)}` : '· líder'}</span>
                </span>
                <span className="num text-sm font-semibold">{points}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
