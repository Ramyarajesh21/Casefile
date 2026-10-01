import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import { fetchProfile, fetchStatistics } from '../services/profileService'
import './ProfilePage.css'

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [statisticsError, setStatisticsError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadProfile = async () => {
      setLoading(true)
      setProfileError('')
      setStatisticsError('')
      setProfile(null)
      setStatistics(null)

      const [profileResult, statisticsResult] = await Promise.allSettled([
        fetchProfile(),
        fetchStatistics(),
      ])

      if (!isCurrent) return

      if (profileResult.status === 'fulfilled' && profileResult.value?.user) {
        setProfile(profileResult.value.user)
      } else {
        setProfileError('Profile information could not be loaded. Please try again.')
      }

      if (statisticsResult.status === 'fulfilled') {
        setStatistics(statisticsResult.value || null)
      } else {
        setStatisticsError('Statistics are unavailable right now.')
      }

      setLoading(false)
    }

    loadProfile()
    return () => {
      isCurrent = false
    }
  }, [retryCount])

  const stats = statistics
  const history = Array.isArray(stats?.history) ? stats.history : []
  const hasStatisticValues = stats && [
    'total_investigations',
    'cases_solved',
    'cases_failed',
    'success_rate',
    'average_score',
    'total_xp',
    'current_rank',
  ].some((key) => stats[key] != null)

  return (
    <section className="profile-page">
      <header className="profile-page-heading">
        <p className="eyebrow">Detective file</p>
        <h1>Profile</h1>
      </header>

      {loading && <p className="profile-page-message" role="status">Loading profile...</p>}

      {!loading && profileError && (
        <div className="profile-page-message profile-page-feedback" role="alert">
          <p>{profileError}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !profileError && profile && (
        <>
          <section className="profile-identity" aria-labelledby="profile-identity-title">
            <div className="profile-identity-mark" aria-hidden="true">
              {(profile.full_name || profile.username || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="profile-identity-details">
              <p className="eyebrow">Account</p>
              <h2 id="profile-identity-title">{profile.full_name || profile.username || 'Detective'}</h2>
              {profile.username && <p className="profile-username">@{profile.username}</p>}
              {profile.email && <p>{profile.email}</p>}
            </div>
            {(profile.rank || profile.xp != null) && (
              <div className="profile-rank-block">
                {profile.rank && <span>Rank</span>}
                {profile.rank && <strong>{profile.rank}</strong>}
                {profile.xp != null && <span>{profile.xp} XP</span>}
              </div>
            )}
          </section>

          <section className="profile-statistics" aria-labelledby="profile-statistics-title">
            <div className="profile-section-heading">
              <div>
                <p className="eyebrow">Record</p>
                <h2 id="profile-statistics-title">Investigation statistics</h2>
              </div>
            </div>

            {statisticsError && (
              <div className="profile-page-inline-error" role="status">
                <p>{statisticsError}</p>
                <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
                  Retry statistics
                </button>
              </div>
            )}

            {!statisticsError && hasStatisticValues && (
              <div className="profile-stat-grid">
                {stats.total_investigations != null && <StatCard label="Investigations" value={stats.total_investigations} />}
                {stats.cases_solved != null && <StatCard label="Cases solved" value={stats.cases_solved} tone="success" />}
                {stats.cases_failed != null && <StatCard label="Cases not solved" value={stats.cases_failed} tone="warning" />}
                {stats.success_rate != null && <StatCard label="Success rate" value={`${stats.success_rate}%`} />}
                {stats.average_score != null && <StatCard label="Average score" value={stats.average_score} />}
                {stats.total_xp != null && <StatCard label="Total XP" value={stats.total_xp} />}
                {stats.current_rank && <StatCard label="Current rank" value={stats.current_rank} />}
              </div>
            )}

            {!statisticsError && !hasStatisticValues && (
              <p className="profile-page-empty">Statistics are not available yet.</p>
            )}
          </section>

          <section className="profile-history" aria-labelledby="profile-history-title">
            <div className="profile-section-heading">
              <div>
                <p className="eyebrow">Case log</p>
                <h2 id="profile-history-title">Investigation history</h2>
              </div>
              {!statisticsError && <span>{history.length} {history.length === 1 ? 'record' : 'records'}</span>}
            </div>

            {statisticsError ? (
              <p className="profile-page-empty">Investigation history is unavailable.</p>
            ) : history.length === 0 ? (
              <p className="profile-page-empty">No investigation history is available yet.</p>
            ) : (
              <ol className="profile-history-list">
                {history.map((entry, index) => (
                  <li className="profile-history-entry" key={entry.id ?? `${entry.case_id}-${index}`}>
                    <div className="profile-history-case">
                      <strong>Case #{entry.case_id}</strong>
                      <span className={`profile-history-status status-${(entry.status || 'unknown').toLowerCase()}`}>
                        {entry.status || 'Status unavailable'}
                      </span>
                    </div>
                    <div className="profile-history-result">
                      {entry.result?.solved === true && <span>Case solved</span>}
                      {entry.result?.solved === false && <span>Case not solved</span>}
                      {entry.score != null && <span>Score {entry.score}</span>}
                      {entry.xp != null && <span>{entry.xp} XP</span>}
                    </div>
                    {entry.completed_at && (
                      <time dateTime={entry.completed_at}>{new Date(entry.completed_at).toLocaleString()}</time>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </section>
  )
}

export default ProfilePage