import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCaseById } from '../services/caseService'
import { startInvestigation } from '../services/investigationService'
import './InvestigationPage.css'

const investigationSections = [
  { label: 'Crime Scene', path: 'scene', description: 'Review the scene and its details.' },
  { label: 'Clues', path: 'clues', description: 'Review discovered leads.' },
  { label: 'Evidence', path: 'evidence', description: 'Examine collected evidence.' },
  { label: 'Witnesses', path: 'witnesses', description: 'Review witness statements.' },
  { label: 'Suspects', path: 'suspects', description: 'Compare the people connected to the case.' },
  { label: 'Timeline', path: 'timeline', description: 'Review the sequence of events.' },
  { label: 'Deduction', path: 'deduction', description: 'Connect the facts.' },
  { label: 'Final Accusation', path: 'accusation', description: 'Submit your conclusion.' },
]

function InvestigationPage() {
  const { caseId } = useParams()
  const { user } = useAuth()
  const [caseInfo, setCaseInfo] = useState(null)
  const [investigation, setInvestigation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [caseError, setCaseError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [starting, setStarting] = useState(false)
  const [investigationError, setInvestigationError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadWorkspace = async () => {
      setLoading(true)
      setCaseError('')
      setNotFound(false)
      setInvestigationError('')
      setCaseInfo(null)
      setInvestigation(null)

      try {
        const response = await fetchCaseById(caseId)
        if (!response?.case) {
          if (isCurrent) setNotFound(true)
          return
        }

        if (isCurrent) setCaseInfo(response.case)
      } catch (requestError) {
        if (isCurrent) {
          if (requestError.response?.status === 404) {
            setNotFound(true)
          } else {
            setCaseError('The case workspace could not be loaded. Please try again.')
          }
        }
        return
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadWorkspace()
    return () => {
      isCurrent = false
    }
  }, [caseId, retryCount])

  const openInvestigation = useCallback(async () => {
    if (!caseInfo || !user?.id) return

    setStarting(true)
    setInvestigationError('')
    try {
      const response = await startInvestigation({ user_id: user.id, case_id: caseInfo.id })
      setInvestigation(response?.investigation || null)
      if (!response?.investigation) {
        setInvestigationError('Investigation details were not returned. Please try again.')
      }
    } catch {
      setInvestigationError('Investigation progress is unavailable. Please try again.')
    } finally {
      setStarting(false)
    }
  }, [caseInfo, user?.id])

  useEffect(() => {
    if (caseInfo) openInvestigation()
  }, [caseInfo, openInvestigation])

  const stage = investigation?.current_stage
    ? investigation.current_stage.replaceAll('_', ' ')
    : ''
  const status = investigation?.status || ''

  return (
    <section className="investigation-workspace">
      <Link to={`/cases/${caseId}`} className="investigation-back">&larr; Case details</Link>

      {loading && <p className="investigation-message" role="status">Loading investigation workspace...</p>}

      {!loading && caseError && (
        <div className="investigation-message investigation-feedback" role="alert">
          <p>{caseError}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !caseError && notFound && (
        <div className="investigation-message" role="status">
          <h1>Case not found</h1>
          <p>This investigation does not have an available case file.</p>
        </div>
      )}

      {!loading && !caseError && caseInfo && (
        <>
          <header className="investigation-header">
            <p className="eyebrow">{caseInfo.case_number || 'Investigation'}</p>
            <h1>{caseInfo.title}</h1>
            <p className="investigation-briefing">
              {caseInfo.briefing || caseInfo.description || 'No case briefing is available yet.'}
            </p>

            <div className="investigation-progress" aria-live="polite">
              <div>
                <span className="investigation-progress-label">Investigation status</span>
                <strong>{status ? status.replaceAll('_', ' ') : starting ? 'Starting...' : 'Not started'}</strong>
              </div>
              {stage && <div><span className="investigation-progress-label">Current stage</span><strong>{stage}</strong></div>}
              {investigation?.score != null && <div><span className="investigation-progress-label">Score</span><strong>{investigation.score}</strong></div>}
            </div>

            {investigationError && (
              <div className="investigation-start-error" role="alert">
                <p>{investigationError}</p>
                <button className="secondary-button" type="button" onClick={openInvestigation} disabled={starting}>
                  {starting ? 'Trying...' : 'Retry investigation'}
                </button>
              </div>
            )}
          </header>

          <div className="investigation-section-heading">
            <div>
              <p className="eyebrow">Workspace</p>
              <h2>Investigation sections</h2>
            </div>
            {!investigation && !starting && !investigationError && (
              <p className="investigation-empty-note">Investigation progress is not available.</p>
            )}
          </div>

          <nav className="investigation-section-grid" aria-label="Investigation sections">
            {investigationSections.map((section, index) => (
              <Link
                className="investigation-section-link"
                key={section.path}
                to={`/investigation/${caseId}/${section.path}`}
                aria-disabled={!investigation}
                onClick={(event) => {
                  if (!investigation) event.preventDefault()
                }}
              >
                <span className="investigation-section-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="investigation-section-copy">
                  <strong>{section.label}</strong>
                  <span>{section.description}</span>
                </span>
                <span className="investigation-section-arrow" aria-hidden="true">&rarr;</span>
              </Link>
            ))}
          </nav>
        </>
      )}
    </section>
  )
}

export default InvestigationPage