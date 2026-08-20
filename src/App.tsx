import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupManagePage } from './pages/GroupManagePage';
import { TierTablePage } from './pages/TierTablePage';
import { ScrimCreatePage } from './pages/ScrimCreatePage';
import { ScrimResultPage } from './pages/ScrimResultPage';
import { MatchHistoryPage } from './pages/MatchHistoryPage';
import { StatsPage } from './pages/StatsPage';

// TODO: add auth guard / redirect for protected routes once auth flow is wired up.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/groups" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<ProfileSetupPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:id/manage" element={<GroupManagePage />} />
        <Route path="/groups/:id/tiers" element={<TierTablePage />} />
        <Route path="/groups/:id/scrims/new" element={<ScrimCreatePage />} />
        <Route path="/scrims/:id" element={<ScrimResultPage />} />
        <Route path="/groups/:id/matches" element={<MatchHistoryPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
