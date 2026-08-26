import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useMe } from './features/auth/hooks';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ProfileSetupPage } from './pages/ProfileSetupPage';
import { GroupsPage } from './pages/GroupsPage';
import { GroupManagePage } from './pages/GroupManagePage';
import { TierTablePage } from './pages/TierTablePage';
import { MatchCreatePage } from './pages/MatchCreatePage';
import { TeamFormationPage } from './pages/TeamFormationPage';
import { MatchResultPage } from './pages/MatchResultPage';
import { MatchEvaluationPage } from './pages/MatchEvaluationPage';
import { MatchHistoryPage } from './pages/MatchHistoryPage';
import { StatsPage } from './pages/StatsPage';
import { UserProfilePage } from './pages/UserProfilePage';

// GET /users/me doubles as the session check: 200 means the Google OAuth
// cookie is valid, anything else (401, network error, no backend) means logged out.
// "/" needs to render real homepage content (app name, purpose, privacy link) for
// signed-out visitors instead of bouncing straight to /login — Google's OAuth app
// verification requires the registered homepage URL to show that content directly,
// not redirect to a sign-in page first.
function RootGate() {
  const { data, isLoading, isError } = useMe();
  if (isLoading) return null;
  if (!isError && data) return <Navigate to="/groups" replace />;
  return <LoginPage />;
}

// TODO: guard the /groups, /stats, etc. routes the same way once more pages need it.
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootGate />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/onboarding" element={<ProfileSetupPage />} />
        <Route path="/groups" element={<GroupsPage />} />
        <Route path="/groups/:id/manage" element={<GroupManagePage />} />
        <Route path="/groups/:id/tiers" element={<TierTablePage />} />
        <Route path="/groups/:id/matches/new" element={<MatchCreatePage />} />
        <Route path="/groups/:id/matches" element={<MatchHistoryPage />} />
        <Route path="/matches/:id/teams" element={<TeamFormationPage />} />
        <Route path="/matches/:id/evaluate" element={<MatchEvaluationPage />} />
        <Route path="/matches/:id" element={<MatchResultPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/users/:id" element={<UserProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
