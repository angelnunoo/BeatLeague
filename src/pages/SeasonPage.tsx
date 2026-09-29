import { useState } from 'react'
import { PASS_LEVELS, PASS_PRICE, PASS_XP, SEASON, passProgress, passReward } from '../domain/retention'
import { formatNum } from '../domain/format'
import { useGame } from '../state/store'
import { Button, Meter, PageHead, Panel } from '../components/ui'

export function SeasonPage() {
  const game = useGame()
  const [message, setMessage] = useState('')
  const pass = passProgress(game.state.passXp)
  const levels = Array.from({ length: PASS_LEVELS }, (_, index) => index + 1)
  return (
    <div className="grid gap-4">
      <PageHead kicker={`Temporada ${SEASON.number}`} title={SEASON.name} text={SEASON.detail} />
      <Panel>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-spotify uppercase">Beat Pass</p>
            <p className="font-display text-5xl leading-none">{pass.level}</p>
          </div>
          <p className="text-sm text-muted">{game.state.premium ? 'Premium activo' : 'Pista gratuita'}</p>
        </div>
        <div className="mt-3">
          <Meter value={pass.ratio} gold={game.state.premium} />
          <p className="mt-1 text-xs text-faint">
            <span className="num">{pass.into}</span> / {PASS_XP} XP de pase · cada partida empuja este carril
          </p>
        </div>
        {game.state.premium ? null : (
          <Button className="mt-4" onClick={() => setMessage(game.unlockPremium() ?? 'Pase premium desbloqueado. Las recompensas de la derecha ya cuentan.')}>
            Activar premium · {formatNum(PASS_PRICE)} Beats
          </Button>
        )}
        {message ? <p className="mt-3 text-sm text-gold">{message}</p> : null}
      </Panel>
      <div className="hide-scroll flex gap-2 overflow-x-auto pb-2">
        {levels.map((level) => {
          const open = pass.level >= level
          return (
            <article key={level} className={`w-36 shrink-0 rounded-[24px] border p-3 ${level === pass.level ? 'border-spotify' : 'border-white/10'} ${open ? 'bg-panel' : 'opacity-50'}`}>
              <p className="text-xs text-faint">Nivel {level}</p>
              <p className="mt-3 text-sm font-semibold">{passReward(level, 'free')}</p>
              <p className={`mt-2 text-sm ${game.state.premium && open ? 'text-gold' : 'text-muted'}`}>{passReward(level, 'premium')}</p>
            </article>
          )
        })}
      </div>
      <Panel>
        <h2 className="font-display text-2xl">Esta temporada</h2>
        <ul className="mt-3 grid gap-2 text-sm text-muted">
          <li>Trono temático: Rey del Reggaetón.</li>
          <li>Carta exclusiva de Feid en los niveles 10, 20, 30, 40 y 50 del pase premium.</li>
          <li>Misión de temporada: defender un trono y cerrar una carta épica.</li>
          <li>El ranking histórico no se borra cuando acabe el mes.</li>
        </ul>
      </Panel>
    </div>
  )
}
