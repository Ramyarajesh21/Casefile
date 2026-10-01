import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCaseById } from '../services/caseService'
import { fetchResult } from '../services/investigationService'
import { fetchStatistics } from '../services/profileService'
import './ResultPage.css'

function ResultPage() {
  const { caseId } = useParams()
  const { user } = useAuth()
  const [caseInfo, setCaseInfo] = useState(null)
  const [investigation, setInvestigation] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [unavailable, setUnavailable] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadResult = async () => {
      setLoading(true)
      setError('')
      setUnavailable(false)
      setCaseInfo(null)
      setInvestigation(null)
      setResult(null)

      try {
        const [caseResponse, statisticsResponse] = await Promise.all([
          fetchCaseById(caseId),
          fetchStatistics(),
        ])

        if (!isCurrent) return

        const loadedCase = caseResponse?.case
        if (!loadedCase) {
          setUnavailable(true)
          return
        }
        setCaseInfo(loadedCase)

        const statisticsUserId = statisticsResponse?.user?.id
        const history = Array.isArray(statisticsResponse?.history) ? statisticsResponse.history : []
        const completedInvestigation = history.find((entry) => (
          String(entry.case_id) === String(loadedCase.id)
          && entry.status === 'completed'
          && (statisticsUserId == null || String(statisticsUserId) === String(user?.id))
        ))

        if (!completedInvestigation?.id) {
          setUnavailable(true)
          return
        }

        setInvestigation(completedInvestigation)
        try {
          const resultResponse = await fetchResult(completedInvestigation.id)
          if (isCurrent) {
            if (resultResponse?.result) {
              setResult(resultResponse.result)
            } else {
              setUnavailable(true)
            }
          }
        } catch (requestError) {
          if (isCurrent) {
            if (requestError.response?.status === 404) {
              setUnavailable(true)
            } else {
              setError('The investigation result could not be loaded. Please try again.')
            }
          }
        }
      } catch (requestError) {
        if (isCurrent) {
          if (requestError.response?.status === 404) {
            setUnavailable(true)
          } else {
            setError('The case result could not be loaded. Please try again.')
          }
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadResult()
    return () => {
      isCurrent = false
    }
  }, [caseId, retryCount, user?.id])

  const completedAt = investigation?.completed_at || investigation?.result?.created_at

  return (
    <section className="result-page">
      <p className="eyebrow">Case outcome</p>

      {loading && <p className="result-page-message" role="status">Loading investigation result...</p>}

      {!loading && error && (
        <div className="result-page-message result-page-feedback" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && unavailable && (
        <div className="result-page-unavailable" role="status">
          <h1>Result unavailable</h1>
          <p>No completed result is currently available for this case and account.</p>
          <div className="result-page-actions">
            <Link className="primary-button" to="/cases">Return to Case Library</Link>
            <Link className="secondary-button" to={`/investigation/${caseId}`}>View investigation</Link>
          </div>
        </div>
      )}

      {!loading && !error && !unavailable && result && caseInfo && (
        <>
          <header className="result-page-header">
            <p className="result-page-case-number">{caseInfo.case_number || 'Investigation complete'}</p>
            <h1>{caseInfo.title}</h1>
            <p className={`result-page-outcome${result.solved ? ' is-solved' : ' is-unsolved'}`}>
              {result.solved === true ? 'Case solved' : result.solved === false ? 'Case not solved' : 'Investigation complete'}
            </p>
            {completedAt && (
              <p className="result-page-completion">
                Completed <time dateTime={completedAt}>{new Date(completedAt).toLocaleString()}</time>
              </p>
            )}
          </header>

          <section className="result-page-summary" aria-label="Investigation result">
            {result.score != null && <div><span>Score</span><strong>{result.score}</strong></div>}
            {result.xp != null && <div><span>XP earned</span><strong>{result.xp}</strong></div>}
            {result.accuracy != null && <div><span>Accuracy</span><strong>{result.accuracy}%</strong></div>}
            {result.correct_clues != null && <div><span>Clues recorded</span><strong>{result.correct_clues}</strong></div>}
            {result.correct_deductions != null && <div><span>Deductions recorded</span><strong>{result.correct_deductions}</strong></div>}
          </section>

          {result.feedback && (
            <section className="result-page-feedback-panel">
              <p className="eyebrow">Case notes</p>
              <h2>Investigation feedback</h2>
              <p>{result.feedback}</p>
            </section>
          )}

          <nav className="result-page-actions" aria-label="Next actions">
            <Link className="primary-button" to="/cases">Return to Case Library</Link>
            <Link className="secondary-button" to={`/investigation/${caseId}`}>View investigation</Link>
          </nav>
        </>
      )}
    </section>
  )
}

export default ResultPage