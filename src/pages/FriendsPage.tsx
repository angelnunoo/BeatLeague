import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatNum } from '../domain/format'
import { useGame } from '../state/store'
import { Button, Chip, Mark, PageHead } from '../components/ui'

export function FriendsPage() {
  const game = useGame()
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const results = useMemo(
    () => game.directory.filter((person) => !needle || `${person.name} ${person.handle}`.toLowerCase().includes(needle)),
    [game.directory, needle],
  )

  return (
    <div className="grid gap-4">
      <PageHead kicker="Círculo" title="Amigos" text="Solicitudes, búsqueda y la actividad que enciende la rivalidad." />
      <label className="block">
        <span className="sr-only">Buscar jugadores</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Busca a David, Sergio, Lucía…"
          className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 outline-none"
        />
      </label>

      {game.incoming.length > 0 ? (
        <section className="grid gap-2">
          <h2 className="font-display text-2xl">Solicitudes</h2>
          {game.incoming.map((person) => (
            <article key={person.id} className="flex flex-wrap items-center gap-3 rounded-3xl bg-white/5 p-3">
              <Mark name={person.name} palette={person.palette} size={44} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{person.name}</p>
                <p className="text-sm text-muted">Quiere entrar en tu liga</p>
              </div>
              <Button onClick={() => game.acceptFriend(person.id)}>Aceptar</Button>
              <Button variant="ghost" onClick={() => game.removeRelation(person.id)}>Rechazar</Button>
            </article>
          ))}
        </section>
      ) : null}

      <section className="grid gap-2">
        <h2 className="font-display text-2xl">Tu liga</h2>
        {game.friends.map((person) => {
          const compat = game.compat(person)
          return (
            <article key={person.id} className="rounded-[28px] border border-white/8 bg-panel p-3">
              <div className="flex items-center gap-3">
                <Mark name={person.name} palette={person.palette} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{person.name}</p>
                  <p className="text-sm text-muted">{person.activity[0]}</p>
                </div>
                <Chip tone="green">{compat.percent}%</Chip>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
                <Link to={`/perfil/${person.id}`} className="rounded-full bg-white/8 py-2">Perfil</Link>
                <Link to={`/comparar/${person.id}`} className="rounded-full bg-white/8 py-2">Comparar</Link>
                <Link to={`/jugar/duel?rival=${person.id}`} className="rounded-full bg-spotify py-2 font-semibold text-black">Duelo</Link>
              </div>
            </article>
          )
        })}
      </section>

      <section className="grid gap-2">
        <h2 className="font-display text-2xl">Buscador</h2>
        {results.map((person) => {
          const relation = game.state.relations[person.id]
          return (
            <article key={person.id} className="flex items-center gap-3 rounded-3xl bg-white/5 px-3 py-3">
              <Mark name={person.name} palette={person.palette} size={42} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{person.name}</p>
                <p className="text-xs text-faint">Nivel {person.level} · {formatNum(person.xp)} XP</p>
              </div>
              {relation === 'friend' ? <Chip>Amigos</Chip> : null}
              {relation === 'incoming' ? <Button onClick={() => game.acceptFriend(person.id)}>Aceptar</Button> : null}
              {relation === 'outgoing' ? <Button variant="ghost" onClick={() => game.removeRelation(person.id)}>Cancelar</Button> : null}
              {!relation ? <Button variant="ghost" onClick={() => game.requestFriend(person.id)}>Añadir</Button> : null}
            </article>
          )
        })}
        {results.length === 0 ? <p className="text-sm text-muted">Nadie coincide con esa búsqueda.</p> : null}
      </section>

      {game.outgoing.length > 0 ? <p className="text-sm text-faint">{game.outgoing.length} invitación pendiente de respuesta.</p> : null}
    </div>
  )
}
