import { Link } from 'react-router-dom'
import { EVENTS } from '../domain/retention'
import { PageHead } from '../components/ui'

export function EventsPage() {
  return (
    <div className="grid gap-3">
      <PageHead kicker="Tiempo limitado" title="Eventos" text="Semanas de artista, premios que se van y preguntas que no vuelven al catálogo normal." />
      {EVENTS.map((event) => (
        <Link key={event.id} to={event.href} className="block rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,#173222,#121212)] p-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-spotify uppercase">{event.status}</p>
          <h2 className="mt-2 font-display text-4xl leading-none">{event.name}</h2>
          <p className="mt-2 text-sm text-muted">{event.detail}</p>
        </Link>
      ))}
    </div>
  )
}
