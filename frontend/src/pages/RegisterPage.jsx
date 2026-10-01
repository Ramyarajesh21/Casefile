import { useState } from 'react'
import { Link } from 'react-router-dom'
import { registerUser } from '../services/authService'

function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
    confirm_password: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.full_name || !formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields.')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await registerUser({
        full_name: formData.full_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
      })
      setFormData({
        full_name: '',
        username: '',
        email: '',
        password: '',
        confirm_password: '',
      })
      setSuccess('Account created successfully.')
    } catch (requestError) {
      setError(
        requestError.response?.data?.error
          || requestError.response?.data?.message
          || 'Unable to create account. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow golden">Join the casefile</p>
        <h1>Register</h1>
        {error && <div className="form-error" role="alert">{error}</div>}
        {success && <div className="form-success" role="status">{success}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full Name
            <input name="full_name" value={formData.full_name} onChange={handleChange} />
          </label>
          <label>
            Username
            <input name="username" value={formData.username} onChange={handleChange} />
          </label>
          <label>
            Email
            <input name="email" type="email" value={formData.email} onChange={handleChange} />
          </label>
          <label>
            Password
            <input name="password" type="password" value={formData.password} onChange={handleChange} />
          </label>
          <label>
            Confirm Password
            <input name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </section>
  )
}

export default RegisterPage
