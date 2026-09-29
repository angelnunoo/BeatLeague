import { Link } from 'react-router-dom'
import { timeAgo } from '../domain/format'
import { useGame } from '../state/store'
import { Button, PageHead } from '../components/ui'

export function NotificationsPage() {
  const game = useGame()
  return (
    <div className="grid gap-3">
      <div className="flex items-end justify-between gap-3">
        <PageHead kicker="Pulso social" title="Notificaciones" />
        <Button variant="ghost" onClick={game.readAll}>Leídas</Button>
      </div>
      {game.state.notifications.map((item) => (
        <Link
          key={item.id}
          to={item.href ?? '/'}
          onClick={() => game.readNotification(item.id)}
          className={`block rounded-[24px] border px-4 py-3 ${item.read ? 'border-transparent bg-white/4' : 'border-spotify/30 bg-spotify/10'}`}
        >
          <p>{item.text}</p>
          <p className="mt-1 text-xs text-faint">{timeAgo(item.at)}</p>
        </Link>
      ))}
      {game.state.notifications.length === 0 ? <p className="text-sm text-muted">El círculo está en silencio.</p> : null}
    </div>
  )
}
