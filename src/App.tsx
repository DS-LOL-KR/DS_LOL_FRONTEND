import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
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
import { MatchHistoryPage } from './pages/MatchHistoryPage';
import { StatsPage } from './pages/StatsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DiscordLinkPage } from './pages/DiscordLinkPage';
import { consumeReturnTo, saveReturnTo } from './utils/returnTo';

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const LoadingScreen = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const Spinner = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid ${({ theme }) => theme.color.border.base};
  border-top-color: ${({ theme }) => theme.color.text.primary};
  animation: ${spin} 0.7s linear infinite;
`;

// Every session check below goes through this instead of returning null —
// a blank tab during the GET /users/me round trip reads as "the page is
// broken", not "still loading".
function SessionCheck() {
  return (
    <LoadingScreen>
      <Spinner />
    </LoadingScreen>
  );
}

// GET /users/me doubles as the session check: 200 means the Google OAuth
// cookie is valid, anything else (401, network error, no backend) means logged out.
// "/" needs to render real homepage content (app name, purpose, privacy link) for
// signed-out visitors instead of bouncing straight to /login — Google's OAuth app
// verification requires the registered homepage URL to show that content directly,
// not redirect to a sign-in page first.
function RootGate() {
  const { data, isLoading, isError } = useMe();
  if (isLoading) return <SessionCheck />;
  // 저장해둔 원래 주소는 /groups 안쪽의 ReturnToRedirect가 꺼내요 — 렌더 중에 꺼내면
  // StrictMode 이중 렌더에서 값이 먼저 지워질 수 있어서 effect 한 곳에서만 읽음.
  if (!isError && data) return <Navigate to="/groups" replace />;
  return <LoginPage />;
}

// 로그인 직후 OAuth 콜백이 떨어진 첫 화면에서, 로그인 전에 적어둔 원래 주소가 있으면
// 그리로 보냄 (utils/returnTo.ts).
function ReturnToRedirect() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  useEffect(() => {
    const target = consumeReturnTo();
    if (target && target !== pathname + search) navigate(target, { replace: true });
    // 세션이 확인된 직후 한 번만.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// Every route besides "/", "/login", "/privacy" and the 404 catch-all needs a
// live session — anonymous access falls through to the 401 the page's own
// queries get, which reads as "the server is broken" rather than "log in".
function RequireAuth() {
  const { data, isLoading, isError } = useMe();
  const { pathname, search } = useLocation();
  if (isLoading) return <SessionCheck />;
  if (isError || !data) {
    saveReturnTo(pathname + search);
    return <Navigate to="/login" replace />;
  }
  return (
    <>
      <ReturnToRedirect />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootGate />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/onboarding" element={<ProfileSetupPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:id/manage" element={<GroupManagePage />} />
          <Route path="/groups/:id/tiers" element={<TierTablePage />} />
          <Route path="/groups/:id/matches/new" element={<MatchCreatePage />} />
          <Route path="/groups/:id/matches" element={<MatchHistoryPage />} />
          <Route path="/matches/:id/teams" element={<TeamFormationPage />} />
          <Route path="/matches/:id" element={<MatchResultPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/users/:id" element={<UserProfilePage />} />
          <Route path="/discord/link" element={<DiscordLinkPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
