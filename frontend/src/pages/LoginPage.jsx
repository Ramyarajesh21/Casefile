import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ACCOUNT_DELETED_NOTICE_KEY, SIGNED_OUT_NOTICE_KEY, loginUser } from '../services/authService'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn } = useAuth()
  const signedOut = location.state?.signedOut || (() => {
    try {
      return window.sessionStorage.getItem(SIGNED_OUT_NOTICE_KEY) === 'true'
    } catch {
      return false
    }
  })()
  const accountDeleted = location.state?.accountDeleted || (() => {
    try {
      return window.sessionStorage.getItem(ACCOUNT_DELETED_NOTICE_KEY) === 'true'
    } catch {
      return false
    }
  })()
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      window.sessionStorage.removeItem(SIGNED_OUT_NOTICE_KEY)
      window.sessionStorage.removeItem(ACCOUNT_DELETED_NOTICE_KEY)
    } catch {
      // The route state still carries the notice when storage is unavailable.
    }
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await loginUser({
        username: formData.username.trim(),
        password: formData.password,
      })
      if (!signIn(response?.user)) {
        setError('Login succeeded, but the account details were unavailable.')
        return
      }
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to sign in. Check your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow golden">Sign in</p>
        <h1>Login</h1>
        {signedOut && (
          <div className="form-success" role="status">You have signed out successfully.</div>
        )}
        {accountDeleted && (
          <div className="form-success" role="status">Your account has been deleted successfully.</div>
        )}
        {error && <div className="form-error" role="alert">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username or Email
            <input name="username" value={formData.username} onChange={handleChange} />
          </label>
          <label>
            Password
            <input name="password" type="password" value={formData.password} onChange={handleChange} />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/register">Create account</Link>
          <Link to="/">Forgot password</Link>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
