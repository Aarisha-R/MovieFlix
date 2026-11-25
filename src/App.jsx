import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import './css/App.css';
import Home from "./pages/Home";
import Favorite from "./pages/Favorite";
import Profiles from "./pages/Profiles";
import AccountPage from "./pages/AccountPage";
import NavBar from './components/NavBar';
import { MovieProvider } from './context/MovieContext';
import { ProfileProvider, useProfileContext } from './context/ProfileContext';

function AppContent() {
  const {
    user,
    activeProfile,
    status,
    connectionError,
    retryConnection,
  } = useProfileContext();
  const location = useLocation();
  const isPublicPage = ["/login", "/register"].includes(location.pathname);
  const isProfilesPage = location.pathname === "/profiles";

  if (status === "loading") {
    return <main className="account-status">Connecting to MovieFlix…</main>;
  }

  if (status === "error") {
    return (
      <main className="account-status">
        <section className="account-status-card">
          <p className="eyebrow">ACCOUNT CONNECTION</p>
          <h1>We couldn't reach the account service</h1>
          <p>{connectionError}</p>
          <p>Start the API server and make sure its PostgreSQL connection is configured.</p>
          <button type="button" className="account-submit" onClick={retryConnection}>
            Try again
          </button>
        </section>
      </main>
    );
  }

  return (
    <>
      {user && activeProfile && !isProfilesPage && !isPublicPage && <NavBar />}
      <main className={`main-content${isProfilesPage ? " profile-main" : ""}`}>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/profiles" replace /> : <AccountPage mode="login" />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/profiles" replace /> : <AccountPage mode="register" />}
          />
          <Route
            path="/profiles"
            element={user ? <Profiles /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/"
            element={
              !user ? <Navigate to="/login" replace /> :
                activeProfile ? <Home /> : <Navigate to="/profiles" replace />
            }
          />
          <Route
            path="/Favorite"
            element={
              !user ? <Navigate to="/login" replace /> :
                activeProfile ? <Favorite /> : <Navigate to="/profiles" replace />
            }
          />
          <Route
            path="*"
            element={
              !user ? <Navigate to="/login" replace /> :
                activeProfile ? <Navigate to="/" replace /> : <Navigate to="/profiles" replace />
            }
          />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <ProfileProvider>
      <MovieProvider>
        <AppContent />
      </MovieProvider>
    </ProfileProvider>
  );
}

export default App;
