import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import CaseCard from '../components/CaseCard'
import StatCard from '../components/StatCard'
import { fetchCases } from '../services/caseService'
import { fetchProfile, fetchStatistics } from '../services/profileService'
import './DashboardPage.css'

function DashboardPage() {
  const { user: sessionUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [profileUnavailable, setProfileUnavailable] = useState(false)
  const [statisticsUnavailable, setStatisticsUnavailable] = useState(false)
  const [casesUnavailable, setCasesUnavailable] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadDashboard = async () => {
      setLoading(true)
      setProfileUnavailable(false)
      setStatisticsUnavailable(false)
      setCasesUnavailable(false)

      const [profileResult, statisticsResult, casesResult] = await Promise.allSettled([
        fetchProfile(),
        fetchStatistics(),
        fetchCases(),
      ])

      if (!isCurrent) return

      if (profileResult.status === 'fulfilled' && profileResult.value?.user) {
        setProfile(profileResult.value.user)
      } else {
        setProfile(null)
        setProfileUnavailable(true)
      }

      if (statisticsResult.status === 'fulfilled') {
        setStatistics(statisticsResult.value || null)
      } else {
        setStatistics(null)
        setStatisticsUnavailable(true)
      }

      if (casesResult.status === 'fulfilled' && Array.isArray(casesResult.value?.cases)) {
        setCases(casesResult.value.cases)
      } else {
        setCases([])
        setCasesUnavailable(true)
      }

      setLoading(false)
    }

    loadDashboard()
    return () => {
      isCurrent = false
    }
  }, [retryCount])

  const displayedUser = profile || sessionUser
  const history = Array.isArray(statistics?.history) ? statistics.history : []
  const activeInvestigation = history.find((entry) => ['active', 'in_progress'].includes((entry.status || '').toLowerCase()))
  const recentInvestigations = [...history]
    .sort((first, second) => new Date(second.completed_at || 0) - new Date(first.completed_at || 0))
    .slice(0, 3)
  const featuredCases = cases.slice(0, 3)
  const hasStatistics = statistics && [
    'total_investigations',
    'cases_solved',
    'success_rate',
    'total_xp',
  ].some((key) => statistics[key] != null)

  return (
    <section className="dashboard-page">
      <header className="dashboard-heading">
        <div>
          <p className="eyebrow golden">Detective bureau / Case desk</p>
          <h1>Welcome back, {displayedUser?.full_name || displayedUser?.username || 'Detective'}</h1>
          <p className="dashboard-intro">Your open cases and latest field record, all in one place.</p>
        </div>
        {displayedUser && (displayedUser.rank || displayedUser.xp != null) && (
          <div className="dashboard-rank" aria-label="Detective standing">
            {displayedUser.rank && <span>{displayedUser.rank}</span>}
            {displayedUser.xp != null && <strong>{displayedUser.xp} <small>XP</small></strong>}
          </div>
        )}
      </header>

      {loading && <p className="dashboard-message" role="status">Loading your case desk...</p>}

      {!loading && profileUnavailable && !sessionUser && (
        <div className="dashboard-notice" role="status">
          <p>Account details are unavailable right now. Your case desk is still shown below.</p>
          <button className="secondary-button small-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Retry loading
          </button>
        </div>
      )}

      {!loading && (
        <>
          <section className="dashboard-section dashboard-record" aria-labelledby="dashboard-record-title">
            <div className="dashboard-section-heading">
              <div>
                <p className="eyebrow">Your record</p>
                <h2 id="dashboard-record-title">Investigation statistics</h2>
              </div>
              <Link to="/profile" className="dashboard-text-link">Full profile <span aria-hidden="true">&rarr;</span></Link>
            </div>
            {statisticsUnavailable ? (
              <div className="dashboard-notice" role="status">
                <p>Investigation statistics are unavailable right now.</p>
                <button className="secondary-button small-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
                  Try again
                </button>
              </div>
            ) : hasStatistics ? (
              <div className="dashboard-stat-grid">
                {statistics.total_investigations != null && <StatCard label="Investigations" value={statistics.total_investigations} />}
                {statistics.cases_solved != null && <StatCard label="Cases solved" value={statistics.cases_solved} tone="success" />}
                {statistics.success_rate != null && <StatCard label="Success rate" value={`${statistics.success_rate}%`} />}
                {(statistics.total_xp ?? displayedUser?.xp) != null && <StatCard label="Total XP" value={statistics.total_xp ?? displayedUser.xp} />}
              </div>
            ) : (
              <p className="dashboard-empty">No investigation statistics are available yet.</p>
            )}
          </section>

          <section className="dashboard-section" aria-labelledby="dashboard-investigations-title">
            <div className="dashboard-section-heading">
              <div>
                <p className="eyebrow">Case log</p>
                <h2 id="dashboard-investigations-title">Investigation activity</h2>
              </div>
            </div>
            {statisticsUnavailable ? (
              <p className="dashboard-empty">Recent investigations are unavailable.</p>
            ) : activeInvestigation ? (
              <article className="dashboard-active-investigation">
                <div>
                  <span className="dashboard-status">Active investigation</span>
                  <h3>Case #{activeInvestigation.case_id}</h3>
                  <p>Pick up where you left off in the investigation workspace.</p>
                </div>
                <Link className="primary-button" to={`/investigation/${activeInvestigation.case_id}`}>
                  Continue investigation <span aria-hidden="true">&rarr;</span>
                </Link>
              </article>
            ) : recentInvestigations.length > 0 ? (
              <ul className="dashboard-history-list">
                {recentInvestigations.map((entry, index) => (
                  <li key={entry.id ?? `${entry.case_id}-${index}`}>
                    <Link to={`/cases/${entry.case_id}`}>
                      <span>Case #{entry.case_id}</span>
                      <strong>{entry.status || 'Status unavailable'}</strong>
                    </Link>
                    {entry.completed_at && <time dateTime={entry.completed_at}>{new Date(entry.completed_at).toLocaleDateString()}</time>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="dashboard-empty">No investigations yet. Choose a case to begin your first.</p>
            )}
          </section>

          <section className="dashboard-section dashboard-cases" aria-labelledby="dashboard-cases-title">
            <div className="dashboard-section-heading">
              <div>
                <p className="eyebrow">Available files</p>
                <h2 id="dashboard-cases-title">Cases to investigate</h2>
              </div>
              <Link to="/cases" className="dashboard-text-link">Explore cases <span aria-hidden="true">&rarr;</span></Link>
            </div>
            {casesUnavailable ? (
              <div className="dashboard-notice" role="status">
                <p>The case library is unavailable right now.</p>
                <button className="secondary-button small-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
                  Try again
                </button>
              </div>
            ) : cases.length === 0 ? (
              <p className="dashboard-empty">No cases are available yet.</p>
            ) : (
              <div className="dashboard-case-grid">
                {featuredCases.map((caseItem) => <CaseCard key={caseItem.id} caseItem={caseItem} />)}
              </div>
            )}
            <Link to="/cases" className="secondary-button dashboard-explore-button">Explore all cases</Link>
          </section>
        </>
      )}
    </section>
  )
}

export default DashboardPage