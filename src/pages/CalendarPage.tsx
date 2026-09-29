import { useState } from 'react'
import { calendarReward } from '../domain/retention'
import { dayKey } from '../domain/format'
import { useGame } from '../state/store'
import { Button, PageHead } from '../components/ui'

export function CalendarPage() {
  const game = useGame()
  const [message, setMessage] = useState('')
  const claimed = game.state.calendarDay
  const todayOpen = game.state.lastClaim !== dayKey()
  const days = Array.from({ length: 30 }, (_, index) => calendarReward(index + 1))
  return (
    <div className="grid gap-4">
      <PageHead kicker="Cada día cuenta" title="Calendario" text="Entrar mantiene el fuego. Saltarte un día no borra lo ya cobrado, pero la racha de juego sí vuelve a x1." />
      <Button
        full
        disabled={!todayOpen}
        onClick={() => setMessage(game.claimCalendar() ?? '')}
      >
        {todayOpen ? `Recoger día ${Math.min(30, claimed + 1)}` : 'Hoy ya está recogido'}
      </Button>
      {message ? <p className="text-sm text-gold">{message}</p> : null}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {days.map((day) => {
          const done = day.day <= claimed
          const next = todayOpen && day.day === claimed + 1
          return (
            <article key={day.day} className={`rounded-[22px] border p-3 ${done ? 'border-spotify/40 bg-spotify/10' : next ? 'border-gold bg-gold/10' : 'border-white/10 bg-white/5'}`}>
              <p className="text-xs text-faint">Día {day.day}</p>
              <p className="mt-2 font-semibold">{day.label}</p>
              <p className="text-xs text-muted">{done ? 'Hecho' : day.detail}</p>
            </article>
          )
        })}
      </div>
    </div>
  )
}
