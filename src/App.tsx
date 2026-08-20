import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useMe } from './features/auth/hooks';
import { LoginPage } from './pages/LoginPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupManagePage } from './pages/GroupManagePage';
import { TierTablePage } from './pages/TierTablePage';
import { ScrimCreatePage } from './pages/ScrimCreatePage';
import { TeamFormationPage } from './pages/TeamFormationPage';
import { ScrimResultPage } from './pages/ScrimResultPage';
import { ScrimEvaluationPage } from './pages/ScrimEvaluationPage';
import { MatchHistoryPage } from './pages/MatchHistoryPage';
import { StatsPage } from './pages/StatsPage';

// GET /users/me doubles as the session check: 200 means the Google OAuth
// cookie is valid, anything else (401, network error, no backend) means logged out.
function RootGate() {
  const { data, isLoading, isError } = useMe();
  if (isLoading) return null;
  return <Navigate to={isError || !data ? '/login' : '/groups'} replace />;
}

// TODO: guard the /groups, /stats, etc. routes the same way once more pages need it.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootGate />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/onboarding" element={<ProfileSetupPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:id/manage" element={<GroupManagePage />} />
        <Route path="/groups/:id/tiers" element={<TierTablePage />} />
        <Route path="/groups/:id/scrims/new" element={<ScrimCreatePage />} />
        <Route path="/scrims/:id/teams" element={<TeamFormationPage />} />
        <Route path="/scrims/:id/evaluate" element={<ScrimEvaluationPage />} />
        <Route path="/scrims/:id" element={<ScrimResultPage />} />
        <Route path="/groups/:id/matches" element={<MatchHistoryPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
