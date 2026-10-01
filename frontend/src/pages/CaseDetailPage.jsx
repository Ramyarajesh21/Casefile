import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCaseById } from '../services/caseService'
import { startInvestigation } from '../services/investigationService'
import case001HomePlan from '../assets/case-001-home.svg'
import './CaseDetailPage.css'

function CaseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [caseInfo, setCaseInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [starting, setStarting] = useState(false)
  const [actionError, setActionError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadCase = async () => {
      setLoading(true)
      setError('')
      setNotFound(false)

      try {
        const response = await fetchCaseById(id)
        if (isCurrent) {
          setCaseInfo(response?.case || null)
          setNotFound(!response?.case)
        }
      } catch (requestError) {
        if (isCurrent) {
          if (requestError.response?.status === 404) {
            setNotFound(true)
          } else {
            setError('This case could not be loaded right now. Please try again.')
          }
          setCaseInfo(null)
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadCase()
    return () => {
      isCurrent = false
    }
  }, [id, retryCount])

  const handleInvestigation = async () => {
    setStarting(true)
    setActionError('')

    try {
      await startInvestigation({ user_id: user.id, case_id: caseInfo.id })
      navigate(`/investigation/${caseInfo.id}`)
    } catch {
      setActionError('The investigation could not be started. Please try again.')
    } finally {
      setStarting(false)
    }
  }

  return (
    <section className="case-detail">
      <Link to="/cases" className="case-detail-back">&larr; Case Library</Link>

      {loading && <p className="case-detail-message" role="status">Loading case...</p>}

      {!loading && error && (
        <div className="case-detail-message case-detail-feedback" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && notFound && (
        <div className="case-detail-message" role="status">
          <h1>Case not found</h1>
          <p>This case may have been removed or is no longer available.</p>
        </div>
      )}

      {!loading && !error && caseInfo && (
        caseInfo.case_number === 'CASE 001' ? (
          <>
            <header className="case-detail-header case-detail-header-beginner">
              <div className="case-detail-identifiers">
                <p className="eyebrow">{caseInfo.case_number}</p>
                <span className="badge difficulty-easy">EASY</span>
              </div>
              <h1>{caseInfo.title}</h1>
              <p className="case-detail-beginner-location">{caseInfo.location}</p>
            </header>

            <div className="case-detail-beginner-intro">
              <figure className="case-detail-home-plan">
                <img src={case001HomePlan} alt="Simple home plan showing the front room, bedroom, kitchen, and backyard" />
                <figcaption>Meena's House</figcaption>
              </figure>
              <section className="case-detail-beginner-section">
                <p className="eyebrow">WHAT HAPPENED?</p>
                <p className="case-detail-beginner-story">{caseInfo.description}</p>
              </section>
            </div>

            <section className="case-detail-beginner-section">
              <p className="eyebrow">PEOPLE</p>
              <ul className="case-detail-people-list">
                <li><strong>Meena</strong><span>Owner</span></li>
                <li><strong>Divya</strong><span>Cousin</span></li>
                <li><strong>Kumar</strong><span>Neighbor</span></li>
                <li><strong>Ravi</strong><span>Family friend</span></li>
              </ul>
            </section>

            <section className="case-detail-beginner-section">
              <p className="eyebrow">WHAT WE KNOW</p>
              <ul className="case-detail-facts-list">
                {(caseInfo.known_facts || '').split(/\r?\n/).filter(Boolean).map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </section>

            <section className="case-detail-beginner-task">
              <div>
                <p className="eyebrow">YOUR TASK</p>
                <p>Find out who took the necklace by checking the clues and what each person says.</p>
              </div>
              <button className="primary-button" type="button" onClick={handleInvestigation} disabled={starting}>
                {starting ? 'Opening...' : 'Start Investigation'}
              </button>
              {actionError && <p className="case-detail-action-error" role="alert">{actionError}</p>}
            </section>
          </>
        ) : (
        <>
          <header className="case-detail-header">
            <div className="case-detail-identifiers">
              <p className="eyebrow">{caseInfo.case_number || 'Case file'}</p>
              <span className={`badge difficulty-${(caseInfo.difficulty || 'unknown').toLowerCase()}`}>
                {caseInfo.difficulty || 'Difficulty unavailable'}
              </span>
            </div>
            <h1>{caseInfo.title}</h1>
            <p className="case-detail-description">{caseInfo.description}</p>
            <div className="case-detail-actions">
              <button className="primary-button" type="button" onClick={handleInvestigation} disabled={starting}>
                {starting ? 'Opening...' : 'Start / Continue Investigation'}
              </button>
              {caseInfo.status && <span className="case-detail-status">Case status: {caseInfo.status}</span>}
            </div>
            {actionError && <p className="case-detail-action-error" role="alert">{actionError}</p>}
          </header>

          <div className="case-detail-content">
            <section className="case-detail-briefing">
              <p className="eyebrow">Case briefing</p>
              <h2>Known facts</h2>
              <p>{caseInfo.briefing || caseInfo.known_facts || 'No briefing information is available yet.'}</p>
              {caseInfo.briefing && caseInfo.known_facts && caseInfo.known_facts !== caseInfo.briefing && (
                <div className="case-detail-facts">
                  <h3>Additional facts</h3>
                  <p>{caseInfo.known_facts}</p>
                </div>
              )}
            </section>

            <aside className="case-detail-information">
              <h2>Case information</h2>
              <dl>
                {caseInfo.victim_name && <div><dt>Victim</dt><dd>{caseInfo.victim_name}</dd></div>}
                {caseInfo.crime_type && <div><dt>Incident</dt><dd>{caseInfo.crime_type}</dd></div>}
                {caseInfo.location && <div><dt>Location</dt><dd>{caseInfo.location}</dd></div>}
                {(caseInfo.incident_date || caseInfo.incident_time) && (
                  <div><dt>Incident time</dt><dd>{[caseInfo.incident_date, caseInfo.incident_time].filter(Boolean).join(' at ')}</dd></div>
                )}
                {caseInfo.clue_count != null && <div><dt>Known clues</dt><dd>{caseInfo.clue_count}</dd></div>}
                {caseInfo.suspect_count != null && <div><dt>Known suspects</dt><dd>{caseInfo.suspect_count}</dd></div>}
                {caseInfo.witness_availability && <div><dt>Witnesses</dt><dd>{caseInfo.witness_availability}</dd></div>}
              </dl>
            </aside>
          </div>
        </>
        )
      )}
    </section>
  )
}

export default CaseDetailPage