import { Link, useParams } from 'react-router-dom'
import { PEOPLE } from '../data/people'
import { formatMinutes } from '../domain/format'
import { useGame } from '../state/store'
import { Mark, Meter, PageHead, Panel } from '../components/ui'

export function ComparePage() {
  const { personId = '' } = useParams()
  const game = useGame()
  const person = PEOPLE.find((item) => item.id === personId)
  if (!person || person.id === 'angel') {
    return (
      <div>
        <PageHead kicker="Comparar" title="Elige un amigo" />
        <Link to="/amigos" className="text-spotify">Volver a amigos</Link>
      </div>
    )
  }
  const report = game.compat(person)
  return (
    <div className="grid gap-4">
      <PageHead kicker="Compatibilidad" title={`${game.me.name} y ${person.name}`} text="Artistas, géneros y canciones que compartís de verdad." />
      <Panel className="text-center">
        <div className="flex items-center justify-center gap-4">
          <Mark name={game.me.name} palette={game.me.palette} size={64} />
          <p className="font-display text-6xl text-spotify">{report.percent}%</p>
          <Mark name={person.name} palette={person.palette} size={64} />
        </div>
        <p className="mt-2 text-sm text-muted">{game.me.name} ♥ {person.name}</p>
      </Panel>
      <div className="grid gap-3 sm:grid-cols-3">
        <List title="Artistas en común" items={report.sharedArtists} />
        <List title="Géneros en común" items={report.sharedGenres} />
        <List title="Canciones compartidas" items={report.sharedTracks} />
      </div>
      <Panel>
        <h2 className="font-display text-2xl">Escucha</h2>
        <CompareBar label={game.me.name} value={report.youMinutes} max={Math.max(report.youMinutes, report.themMinutes)} />
        <CompareBar label={person.name} value={report.themMinutes} max={Math.max(report.youMinutes, report.themMinutes)} />
        <p className="mt-3 text-sm text-muted">
          {formatMinutes(report.youMinutes)} frente a {formatMinutes(report.themMinutes)} en la temporada visible.
        </p>
      </Panel>
      <Link to={`/jugar/duel?rival=${person.id}`} className="rounded-full bg-spotify py-3 text-center font-semibold text-black">
        Duelo contra {person.name}
      </Link>
    </div>
  )
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <Panel>
      <h2 className="font-semibold">{title}</h2>
      <ul className="mt-2 grid gap-1 text-sm text-muted">
        {items.length === 0 ? <li>Todavía no hay cruce.</li> : items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </Panel>
  )
}

function CompareBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted">{formatMinutes(value)}</span>
      </div>
      <Meter value={max ? value / max : 0} />
    </div>
  )
}
