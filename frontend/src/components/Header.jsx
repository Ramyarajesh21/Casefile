import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SIGNED_OUT_NOTICE_KEY } from '../services/authService'

function Header() {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout } = useAuth()

  const handleLogout = () => {
    try {
      window.sessionStorage.setItem(SIGNED_OUT_NOTICE_KEY, 'true')
    } catch {
      // Route state remains as a fallback when browser storage is unavailable.
    }
    logout()
    navigate('/login', { replace: true, state: { signedOut: true } })
  }

  return (
    <header className="topbar">
      <div className="container nav-shell">
        <Link to="/" className="brand" aria-label="CASEFILE home">
          <span className="brand-mark">C</span>
          <span>CASEFILE</span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/cases">Cases</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/settings">Settings</Link>
            </>
          ) : (
            <>
              <Link to="/register">Create account</Link>
            </>
          )}
        </nav>

        <div className="nav-user">
          {isAuthenticated ? (
            <>
              {user?.xp != null && <span className="xp-pill">XP {user.xp}</span>}
              {user?.rank && <span className="rank-pill">{user.rank}</span>}
              <button className="secondary-button logout-button" type="button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link className="primary-button small-button" to="/login">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
