import type { MusicProviderId } from '../types'

export type MusicConnector = {
  id: MusicProviderId
  label: string
  status: 'ready'
  note: string
}

export const CONNECTORS: MusicConnector[] = [
  {
    id: 'demo',
    label: 'Liga demo',
    status: 'ready',
    note: 'Tu círculo de ejemplo. También puntúa por canciones y minutos, para que la liga se mueva sin conectar nada.',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    status: 'ready',
    note: 'Cada reproducción del historial reciente cuenta. La misma canción, otra vez, suma otra vez.',
  },
  {
    id: 'apple',
    label: 'Apple Music',
    status: 'ready',
    note: 'Historial reciente y rotación. Una canción nueva suma; si vuelve a entrar después de otras, cuenta otra reproducción.',
  },
]
