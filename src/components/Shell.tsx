import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { formatNum } from '../domain/format'
import { useGame } from '../state/store'

const MAIN = [
  { to: '/', label: 'Inicio', icon: HomeIcon },
  { to: '/juegos', label: 'Juegos', icon: PlayIcon },
  { to: '/liga', label: 'Liga', icon: CrownIcon },
  { to: '/amigos', label: 'Amigos', icon: PeopleIcon },
  { to: '/perfil', label: 'Perfil', icon: UserIcon },
]

const MORE = [
  ['/estadisticas', 'Estadísticas'],
  ['/tronos', 'Tronos'],
  ['/temporada', 'Temporada'],
  ['/calendario', 'Calendario'],
  ['/cartas', 'Cartas'],
  ['/trending', 'Trending'],
  ['/wrapped', 'Wrapped'],
  ['/predice', 'Predice'],
  ['/eventos', 'Eventos'],
  ['/estudio', 'Estudio'],
  ['/misiones', 'Misiones'],
  ['/logros', 'Logros'],
  ['/tienda', 'Tienda'],
  ['/notificaciones', 'Avisos'],
  ['/ajustes', 'Ajustes'],
] as const

export function Shell() {
  const game = useGame()
  const navigate = useNavigate()
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-white/8 bg-black/40 px-4 py-5 md:flex">
        <button type="button" onClick={() => navigate('/')} className="px-2 text-left">
          <span className="font-display text-2xl tracking-tight">BEATLEAGUE</span>
          <span className="mt-1 block text-xs text-muted">Tu música. Tus amigos. Tu liga.</span>
        </button>
        <nav className="mt-8 grid gap-1" aria-label="Principal">
          {MAIN.map((item) => (
            <SideLink key={item.to} to={item.to} label={item.label} />
          ))}
        </nav>
        <p className="mt-8 px-3 text-[11px] font-semibold tracking-[0.16em] text-faint uppercase">Más liga</p>
        <nav className="mt-2 grid gap-1 overflow-auto" aria-label="Secciones">
          {MORE.map(([to, label]) => (
            <SideLink key={to} to={to} label={label} />
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/8 bg-ink/80 px-4 py-3 backdrop-blur-xl">
          <button type="button" onClick={() => navigate('/')} className="font-display text-xl md:hidden">
            BEATLEAGUE
          </button>
        <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => navigate('/misiones')} className="rounded-full bg-white/8 px-3 py-1.5 text-sm" aria-label={`${game.me.streak} días de racha`}>
              🔥 <span className="num">{game.me.streak}</span>
            </button>
            <button type="button" onClick={() => navigate('/tienda')} className="rounded-full bg-spotify/15 px-3 py-1.5 text-sm font-semibold text-spotify">
              <span className="num">{formatNum(game.state.coins)}</span> Beats
            </button>
            <button type="button" onClick={() => navigate('/notificaciones')} className="relative grid h-10 w-10 place-items-center rounded-full bg-white/8" aria-label="Notificaciones">
              <BellIcon />
              {game.unread > 0 ? <span className="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-spotify px-1 text-[10px] font-bold text-black">{game.unread}</span> : null}
            </button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl px-4 pt-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] md:pb-10">
          <Outlet />
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-white/10 bg-[#0c0c0c]/95 px-2 pt-2 pb-[calc(0.4rem+env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden" aria-label="Navegación móvil">
        {MAIN.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `grid justify-items-center gap-1 py-1 text-[11px] ${isActive ? 'text-spotify' : 'text-faint'}`}>
            <item.icon />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function SideLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} end={to === '/'} className={({ isActive }) => `rounded-2xl px-3 py-2 text-sm ${isActive ? 'bg-spotify text-black' : 'text-muted hover:bg-white/6 hover:text-white'}`}>
      {label}
    </NavLink>
  )
}

function HomeIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" /></svg>
}
function PlayIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5Z" /></svg>
}
function CrownIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 17h18l-1.5-9-4.5 4L12 5 8 12 3.5 8 3 17Z" /></svg>
}
function PeopleIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 13a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.8 0-5 1.4-5 3.2V20h10v-1.8C13 16.4 10.8 15 8 15Zm7.5-2a2.5 2.5 0 1 0-2.5-2.5A2.5 2.5 0 0 0 15.5 13Zm0 1.5c-.5 0-1 .1-1.5.2 1.4.8 2.3 1.9 2.5 3.3H21v-1.2c0-1.5-2.2-2.3-5.5-2.3Z" /></svg>
}
function UserIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.2" /><path d="M5.5 19.5c1.2-2.6 3.4-3.8 6.5-3.8s5.3 1.2 6.5 3.8" /></svg>
}
function BellIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 16V10a6 6 0 1 1 12 0v6l1.5 2H4.5L6 16Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
}
