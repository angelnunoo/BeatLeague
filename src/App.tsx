import { Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { AchievementsPage } from './pages/AchievementsPage'
import { CalendarPage } from './pages/CalendarPage'
import { CardsPage } from './pages/CardsPage'
import { ComparePage } from './pages/ComparePage'
import { EventsPage } from './pages/EventsPage'
import { FriendsPage } from './pages/FriendsPage'
import { GamesPage } from './pages/GamesPage'
import { HomePage } from './pages/HomePage'
import { LeaguePage } from './pages/LeaguePage'
import { MissionsPage } from './pages/MissionsPage'
import { NotificationsPage } from './pages/NotificationsPage'
import { PlayPage } from './pages/PlayPage'
import { PredictPage } from './pages/PredictPage'
import { ProfilePage } from './pages/ProfilePage'
import { SeasonPage } from './pages/SeasonPage'
import { SettingsPage } from './pages/SettingsPage'
import { ShopPage } from './pages/ShopPage'
import { StatsPage } from './pages/StatsPage'
import { StudioPage } from './pages/StudioPage'
import { ThronesPage } from './pages/ThronesPage'
import { TrendingPage } from './pages/TrendingPage'
import { WrappedPage } from './pages/WrappedPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<HomePage />} />
        <Route path="perfil/:personId?" element={<ProfilePage />} />
        <Route path="amigos" element={<FriendsPage />} />
        <Route path="comparar/:personId" element={<ComparePage />} />
        <Route path="juegos" element={<GamesPage />} />
        <Route path="jugar/:mode" element={<PlayPage />} />
        <Route path="liga" element={<LeaguePage />} />
        <Route path="estadisticas" element={<StatsPage />} />
        <Route path="tienda" element={<ShopPage />} />
        <Route path="logros" element={<AchievementsPage />} />
        <Route path="misiones" element={<MissionsPage />} />
        <Route path="notificaciones" element={<NotificationsPage />} />
        <Route path="ajustes" element={<SettingsPage />} />
        <Route path="trending" element={<TrendingPage />} />
        <Route path="wrapped" element={<WrappedPage />} />
        <Route path="predice" element={<PredictPage />} />
        <Route path="cartas" element={<CardsPage />} />
        <Route path="tronos" element={<ThronesPage />} />
        <Route path="temporada" element={<SeasonPage />} />
        <Route path="calendario" element={<CalendarPage />} />
        <Route path="eventos" element={<EventsPage />} />
        <Route path="estudio" element={<StudioPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
