import { Link, useParams } from 'react-router-dom'
import { artistById, trackById } from '../data/catalog'
import { SHOP } from '../data/meta'
import { PEOPLE } from '../data/people'
import { formatMinutes, formatNum } from '../domain/format'
import { artistTier } from '../domain/progression'
import { formatMultiplier, passProgress, streakMultiplier } from '../domain/retention'
import { useGame } from '../state/store'
import { Chip, CoverArt, Mark, Meter, Panel, Stars } from '../components/ui'

export function ProfilePage() {
  const { personId } = useParams()
  const game = useGame()
  const mine = !personId || personId === 'angel'
  const person = mine ? game.me : PEOPLE.find((item) => item.id === personId)
  if (!person) {
    return (
      <div>
        <p className="font-display text-3xl">Ese perfil no está en la liga.</p>
        <Link to="/amigos" className="mt-3 inline-block text-spotify">Volver a amigos</Link>
      </div>
    )
  }
  const compat = mine ? null : game.compat(person)
  const titleItem = SHOP.find((item) => item.id === game.state.equipped.title)
  const frame = SHOP.find((item) => item.id === game.state.equipped.frame)?.palette?.[0]
  const banner = SHOP.find((item) => item.id === game.state.equipped.banner)?.palette ?? person.banner
  const snapshot = mine ? game.snapshot : null
  const artists = mine ? game.snapshot.topArtists : person.listening.map((row) => {
    const artist = artistById(row.artistId)
    return { key: artist.id, name: artist.name, minutes: row.minutes, genres: [artist.genre] }
  })
  const thrones = mine ? game.myThrones : game.thrones.filter((throne) => throne.holderId === person.id)
  const rank = game.standings('weekly').find((row) => row.person.id === person.id)
  const historic = game.standings('historic').find((row) => row.person.id === person.id)
  const pass = mine ? passProgress(game.state.passXp) : null

  return (
    <div className="grid gap-4">
      <section className="rise overflow-hidden rounded-[32px] border border-white/10">
        <div className="h-36" style={{ background: `linear-gradient(120deg, ${banner[0]}, ${mine ? game.state.accent : banner[1]})` }} />
        <div className="-mt-10 px-4 pb-5">
          <Mark name={person.name} palette={person.palette} size={84} glow={mine && game.state.equipped.effect === 'fx-glow'} ring={mine ? frame : undefined} />
          <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-5xl leading-none">{person.name}</h1>
              <p className="mt-1 text-sm text-muted">{person.handle}</p>
            </div>
            <Chip tone="green">Nivel {person.level}</Chip>
          </div>
          <p className="mt-3 text-sm text-muted">
            <span className="num text-white">{formatNum(person.xp)}</span> XP
            {mine ? ` · ${formatNum(game.progress.into)}/${formatNum(game.progress.need)} este nivel` : ''}
          </p>
          {mine ? <div className="mt-2"><Meter value={game.progress.ratio} /></div> : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Chip tone="gold">👑 {thrones[0]?.title ?? person.title}</Chip>
            {titleItem?.titleText ? <Chip>🔥 {titleItem.titleText}</Chip> : null}
            <Chip>🔥 Racha de {person.streak} días{mine ? ` · ${formatMultiplier(streakMultiplier(person.streak))}` : ''}</Chip>
            <Chip>🥇 #{rank?.rank ?? '–'} Liga semanal</Chip>
            <Chip>#{historic?.rank ?? '–'} histórico</Chip>
            {pass ? <Chip>Pase {pass.level}/50</Chip> : null}
          </div>
          {mine ? (
            <Link to="/estudio" className="mt-4 inline-block rounded-full bg-white/8 px-4 py-2 text-sm font-semibold">
              Construir perfil
            </Link>
          ) : null}
        </div>
      </section>

      {compat ? (
        <Panel>
          <p className="text-xs font-semibold tracking-[0.16em] text-spotify uppercase">Compatibilidad</p>
          <p className="mt-1 font-display text-5xl">{compat.percent}%</p>
          <p className="text-sm text-muted">{compat.sharedArtists.slice(0, 4).join(' · ') || 'Pocos cruces todavía'}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to={`/comparar/${person.id}`} className="rounded-full bg-white/8 py-3 text-center text-sm font-semibold">Comparar</Link>
            <Link to={`/jugar/duel?rival=${person.id}`} className="rounded-full bg-spotify py-3 text-center text-sm font-semibold text-black">Desafiar</Link>
          </div>
        </Panel>
      ) : null}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Mini label="Amigos" value={mine ? String(game.friends.length) : '—'} />
        <Mini label="Tronos" value={String(thrones.length)} />
        <Mini label="Cartas" value={mine ? String(game.state.cards.length) : '—'} />
        <Mini label="Escucha" value={formatMinutes(mine ? game.snapshot.listeningMinutes : person.listening.reduce((sum, row) => sum + row.minutes, 0))} />
      </div>

      <section>
        <h2 className="mb-2 font-display text-2xl">Artistas favoritos</h2>
        <div className="grid gap-2">
          {artists.slice(0, 5).map((artist) => {
            const known = mine ? null : artistById(artist.key)
            const xp = mine ? game.state.artistXp[artistIdFromName(artist.name)] ?? 0 : 0
            const tier = artistTier(xp)
            return (
              <div key={artist.key} className="flex items-center gap-3 rounded-3xl bg-white/5 px-3 py-3">
                <Mark name={artist.name} palette={known?.palette ?? ['#1DB954', '#102818']} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-semibold">{artist.name}</p>
                    <span className="text-xs text-muted">{formatMinutes(artist.minutes)}</span>
                  </div>
                  {mine && xp > 0 ? (
                    <p className="text-xs text-gold">{tier.label}</p>
                  ) : (
                    <p className="text-xs text-faint">{artist.genres[0]}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-2xl">Canciones favoritas</h2>
        <div className="hide-scroll flex gap-3 overflow-x-auto">
          {(mine ? game.snapshot.topTracks.map((track) => ({ key: track.key, name: track.name, id: catalogTrackId(track.name) })) : person.topTrackIds.map((id) => ({ key: id, name: trackById(id).title, id }))).map((track) => (
            <div key={track.key} className="w-36 shrink-0">
              {track.id ? <CoverArt trackId={track.id} /> : <div className="grid aspect-square place-items-center rounded-[24px] bg-white/8 font-display text-3xl">{track.name.slice(0, 1)}</div>}
              <p className="mt-2 truncate text-sm font-semibold">{track.name}</p>
            </div>
          ))}
        </div>
      </section>

      {mine ? (
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-2xl">Cartas</h2>
            <Link to="/cartas" className="text-sm text-spotify">Colección</Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {game.state.cards.slice(0, 3).map((card) => {
              const artist = artistById(card.artistId)
              return (
                <div key={card.artistId} className="rounded-[24px] border border-white/10 p-3" style={{ background: `linear-gradient(180deg, ${artist.palette[0]}33, #141414)` }}>
                  <Stars rarity={card.rarity} />
                  <p className="mt-6 font-display text-xl leading-none">{artist.name}</p>
                </div>
              )
            })}
          </div>
        </section>
      ) : null}

      <Panel>
        <h2 className="font-display text-2xl">Actividad reciente</h2>
        <ul className="mt-3 grid gap-2 text-sm text-muted">
          {(snapshot?.recent ?? []).slice(0, 3).map((track) => (
            <li key={`${track.name}-${track.playedAt}`}>{track.name} · {track.artistName}</li>
          ))}
          {person.activity.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/5 px-3 py-3">
      <p className="text-xs text-faint">{label}</p>
      <p className="mt-1 font-display text-2xl leading-none">{value}</p>
    </div>
  )
}

function artistIdFromName(name: string) {
  const artist = ['quevedo', 'bad-bunny', 'feid', 'rosalia', 'taylor', 'weeknd', 'arctic', 'dua', 'bizarrap', 'karol', 'rauw', 'aitana', 'billie', 'dragons', 'coldplay'].find((id) => artistById(id).name === name)
  return artist ?? ''
}

function catalogTrackId(name: string) {
  const known = ['bzrp-52', 'columbia', 'titi', 'moscow', 'bonito', 'normal', 'classy', 'luna', 'despecha', 'saoko', 'antihero', 'cruel', 'blinding', 'tears', 'diwk', 'am505', 'levitating', 'dont', 'bzrp-53', 'provenza', 'tqg', 'todo', 'desesperados', 'badguy', 'believer', 'yellow', 'viva', 'angeles', 'formentera']
  return known.find((id) => trackById(id).title === name)
}
