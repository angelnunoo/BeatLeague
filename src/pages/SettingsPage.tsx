import { useState } from 'react'
import { beginAppleLogin, disconnectApple, hasAppleSession, isAppleConfigured, pullAppleSnapshot } from '../music/apple'
import { CONNECTORS } from '../music/connectors'
import { beginSpotifyLogin, hasSpotifySession, isSpotifyConfigured, pullSpotifySnapshot } from '../music/spotify'
import { useGame } from '../state/store'
import { Button, PageHead, Panel } from '../components/ui'

export function SettingsPage() {
  const game = useGame()
  const [message, setMessage] = useState(game.spotifyError)
  const [busy, setBusy] = useState(false)

  async function connectSpotify() {
    setMessage('')
    try {
      await beginSpotifyLogin()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo abrir Spotify.')
    }
  }

  async function refreshSpotify() {
    setBusy(true)
    setMessage('')
    try {
      const snapshot = await pullSpotifySnapshot()
      setMessage(game.adoptSnapshot(snapshot))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Spotify no respondió.')
    } finally {
      setBusy(false)
    }
  }

  async function connectApple() {
    setBusy(true)
    setMessage('')
    try {
      const snapshot = await beginAppleLogin()
      setMessage(game.adoptSnapshot(snapshot))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo abrir Apple Music.')
    } finally {
      setBusy(false)
    }
  }

  async function refreshApple() {
    setBusy(true)
    setMessage('')
    try {
      const snapshot = await pullAppleSnapshot(game.state.ledger.apple.head)
      setMessage(game.adoptSnapshot(snapshot))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Apple Music no respondió.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-4">
      <PageHead kicker="Cuenta" title="Ajustes" text="Spotify y Apple Music leen tu historial. Cada canción distinta y cada reproducción suman puntos de liga." />
      <Panel>
        <label className="block text-sm text-muted" htmlFor="name">Nombre en la liga</label>
        <input id="name" value={game.state.name} onChange={(event) => game.setName(event.target.value)} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-3" />
      </Panel>
      <Panel className="grid gap-3">
        <Toggle label="Sonido de recompensa" pressed={game.state.sound} onClick={() => game.setSound(!game.state.sound)} />
        <Toggle label="Vibración" pressed={game.state.haptics} onClick={() => game.setHaptics(!game.state.haptics)} />
      </Panel>
      <section className="grid gap-2">
        {CONNECTORS.map((connector) => (
          <article key={connector.id} className="rounded-[28px] border border-white/10 bg-panel p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl">{connector.label}</h2>
              <span className="text-xs text-spotify">{game.state.provider === connector.id ? 'Activa' : 'Lista'}</span>
            </div>
            <p className="mt-2 text-sm text-muted">{connector.note}</p>
            {connector.id === 'spotify' ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => void connectSpotify()} disabled={!isSpotifyConfigured()}>{isSpotifyConfigured() ? 'Conectar Spotify' : 'Falta el Client ID'}</Button>
                {hasSpotifySession() ? <Button variant="ghost" disabled={busy} onClick={() => void refreshSpotify()}>Actualizar escucha</Button> : null}
                {game.state.provider === 'spotify' ? <Button variant="ghost" onClick={game.useDemoMusic}>Volver a la demo</Button> : null}
              </div>
            ) : null}
            {connector.id === 'apple' ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => void connectApple()} disabled={!isAppleConfigured() || busy}>{isAppleConfigured() ? 'Conectar Apple Music' : 'Falta el token de desarrollador'}</Button>
                {hasAppleSession() ? <Button variant="ghost" disabled={busy} onClick={() => void refreshApple()}>Actualizar escucha</Button> : null}
                {game.state.provider === 'apple' ? <Button variant="ghost" onClick={() => { void disconnectApple(); game.useDemoMusic() }}>Volver a la demo</Button> : null}
              </div>
            ) : null}
            {connector.id === 'demo' && game.state.provider !== 'demo' ? (
              <Button className="mt-3" variant="ghost" onClick={game.useDemoMusic}>Usar la liga demo</Button>
            ) : null}
          </article>
        ))}
      </section>
      {message ? <p className="text-sm text-gold">{message}</p> : null}
      <Button variant="danger" onClick={game.reset}>Reiniciar progreso local</Button>
      <p className="text-xs text-faint">El reinicio borra la liga guardada en este dispositivo. No toca tu cuenta de Spotify ni la de Apple Music.</p>
    </div>
  )
}

function Toggle({ label, pressed, onClick }: { label: string; pressed: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className="flex items-center justify-between gap-3 text-left">
      <span>{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pressed ? 'bg-spotify text-black' : 'bg-white/10 text-muted'}`}>{pressed ? 'Sí' : 'No'}</span>
    </button>
  )
}
