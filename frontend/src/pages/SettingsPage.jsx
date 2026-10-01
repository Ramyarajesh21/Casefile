import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ACCOUNT_DELETED_NOTICE_KEY, SIGNED_OUT_NOTICE_KEY, deleteAccount } from '../services/authService'
import { fetchProfile } from '../services/profileService'
import './SettingsPage.css'

function SettingsPage() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const deleteDialogRef = useRef(null)

  useEffect(() => {
    let isCurrent = true

    const loadAccount = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetchProfile()
        if (isCurrent) setProfile(response?.user || null)
      } catch {
        if (isCurrent) setError('Account information could not be loaded. Please try again.')
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadAccount()
    return () => {
      isCurrent = false
    }
  }, [retryCount])

  useEffect(() => {
    const dialog = deleteDialogRef.current
    if (!dialog) return
    if (deleteDialogOpen && !dialog.open) dialog.showModal()
    if (!deleteDialogOpen && dialog.open) dialog.close()
  }, [deleteDialogOpen])

  const handleSignOut = () => {
    const confirmed = window.confirm('Sign out of this CASEFILE session?')
    if (!confirmed) return

    setSigningOut(true)
    try {
      window.sessionStorage.setItem(SIGNED_OUT_NOTICE_KEY, 'true')
    } catch {
      // Route state remains as a fallback when browser storage is unavailable.
    }
    logout()
    navigate('/login', { replace: true, state: { signedOut: true } })
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    setDeleteError('')
    try {
      await deleteAccount()
      setDeleteDialogOpen(false)
      try {
        window.sessionStorage.setItem(ACCOUNT_DELETED_NOTICE_KEY, 'true')
      } catch {
        // Route state still carries the notice if browser storage is unavailable.
      }
      logout()
      navigate('/login', { replace: true, state: { accountDeleted: true } })
    } catch (requestError) {
      setDeleteError(
        requestError.response?.data?.error || 'Unable to delete your account. Please try again.',
      )
    } finally {
      setDeletingAccount(false)
    }
  }

  const account = user || profile

  return (
    <section className="settings-page">
      <header className="settings-page-heading">
        <p className="eyebrow">Account</p>
        <h1>Settings</h1>
      </header>

      {loading && <p className="settings-page-message" role="status">Loading account information...</p>}

      {!loading && error && (
        <div className="settings-page-message settings-page-feedback" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && !account && (
        <p className="settings-page-message" role="status">Account information is unavailable.</p>
      )}

      {account && (
        <>
          <section className="settings-section" aria-labelledby="settings-account-title">
            <div className="settings-section-heading">
              <div>
                <p className="eyebrow">Account details</p>
                <h2 id="settings-account-title">Your account</h2>
              </div>
              <Link to="/profile" className="settings-text-link">View profile</Link>
            </div>
            <dl className="settings-account-list">
              {account.full_name && <div><dt>Full name</dt><dd>{account.full_name}</dd></div>}
              {account.username && <div><dt>Username</dt><dd>@{account.username}</dd></div>}
              {account.email && <div><dt>Email</dt><dd>{account.email}</dd></div>}
              {account.rank && <div><dt>Rank</dt><dd>{account.rank}</dd></div>}
              {account.xp != null && <div><dt>Experience</dt><dd>{account.xp} XP</dd></div>}
            </dl>
          </section>

          <section className="settings-section" aria-labelledby="settings-session-title">
            <div className="settings-section-heading">
              <div>
                <p className="eyebrow">Session</p>
                <h2 id="settings-session-title">Session status</h2>
              </div>
              <span className={`settings-session-status${isAuthenticated ? ' is-active' : ''}`}>
                {isAuthenticated ? 'Signed in' : 'Signed out'}
              </span>
            </div>
            <p className="settings-session-description">
              {isAuthenticated
                ? `Current session${account.username ? ` for @${account.username}` : ''}.`
                : 'No account is currently signed in.'}
            </p>
            {isAuthenticated && (
              <button className="secondary-button settings-signout-button" type="button" onClick={handleSignOut} disabled={signingOut}>
                {signingOut ? 'Signing out...' : 'Sign out'}
              </button>
            )}
          </section>

          <section className="settings-section" aria-labelledby="settings-preferences-title">
            <div className="settings-section-heading">
              <div>
                <p className="eyebrow">Preferences</p>
                <h2 id="settings-preferences-title">Available preferences</h2>
              </div>
            </div>
            <p className="settings-empty">No configurable preferences are available.</p>
          </section>

          {isAuthenticated && (
            <section className="settings-section settings-danger-zone" aria-labelledby="settings-danger-title">
              <div className="settings-section-heading">
                <div>
                  <p className="eyebrow">Danger Zone</p>
                  <h2 id="settings-danger-title">Delete Account</h2>
                </div>
              </div>
              <p className="settings-danger-description">
                Permanently delete your CASEFILE account and associated investigation data. This action cannot be undone.
              </p>
              <button
                className="settings-delete-button"
                type="button"
                onClick={() => {
                  setDeleteError('')
                  setDeleteDialogOpen(true)
                }}
              >
                Delete Account
              </button>
            </section>
          )}
        </>
      )}

      <dialog
        ref={deleteDialogRef}
        className="settings-delete-dialog"
        aria-labelledby="delete-account-dialog-title"
        onCancel={(event) => {
          event.preventDefault()
          setDeleteDialogOpen(false)
        }}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <h2 id="delete-account-dialog-title">Delete your account?</h2>
        <p>
          Are you sure you want to permanently delete your account? Your account and associated investigation progress will be deleted. This action cannot be undone.
        </p>
        {deleteError && <div className="form-error" role="alert">{deleteError}</div>}
        <div className="settings-dialog-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deletingAccount}
          >
            Cancel
          </button>
          <button
            className="settings-delete-button"
            type="button"
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
          >
            {deletingAccount ? 'Deleting account...' : 'Delete Account'}
          </button>
        </div>
      </dialog>
    </section>
  )
}

export default SettingsPage