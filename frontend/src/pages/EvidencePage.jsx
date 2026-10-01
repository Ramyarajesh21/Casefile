import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCaseById, fetchCaseEvidence } from '../services/caseService'
import { collectEvidence, startInvestigation } from '../services/investigationService'
import './EvidencePage.css'

function EvidencePage() {
  const { caseId } = useParams()
  const { user } = useAuth()
  const [caseInfo, setCaseInfo] = useState(null)
  const [investigation, setInvestigation] = useState(null)
  const [evidenceItems, setEvidenceItems] = useState([])
  const [collectedIds, setCollectedIds] = useState([])
  const [collectingIds, setCollectingIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [evidenceError, setEvidenceError] = useState('')
  const [investigationError, setInvestigationError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadEvidenceBoard = async () => {
      setLoading(true)
      setError('')
      setEvidenceError('')
      setInvestigationError('')
      setNotFound(false)
      setCaseInfo(null)
      setInvestigation(null)
      setEvidenceItems([])
      setCollectedIds([])

      try {
        const caseResponse = await fetchCaseById(caseId)
        const loadedCase = caseResponse?.case
        if (!loadedCase) {
          if (isCurrent) setNotFound(true)
          return
        }
        if (isCurrent) setCaseInfo(loadedCase)

        const [evidenceResult, investigationResult] = await Promise.allSettled([
          fetchCaseEvidence(caseId),
          startInvestigation({ user_id: user.id, case_id: loadedCase.id }),
        ])

        if (!isCurrent) return

        if (evidenceResult.status === 'fulfilled') {
          setEvidenceItems(Array.isArray(evidenceResult.value?.evidence) ? evidenceResult.value.evidence : [])
        } else {
          setEvidenceError('Evidence could not be loaded. Please retry.')
        }

        if (investigationResult.status === 'fulfilled' && investigationResult.value?.investigation) {
          setInvestigation(investigationResult.value.investigation)
        } else {
          setInvestigationError('Investigation progress is unavailable. Retry to enable evidence collection.')
        }
      } catch (requestError) {
        if (isCurrent) {
          if (requestError.response?.status === 404) {
            setNotFound(true)
          } else {
            setError('This case could not be loaded. Please try again.')
          }
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadEvidenceBoard()
    return () => {
      isCurrent = false
    }
  }, [caseId, retryCount, user.id])

  const retryInvestigation = async () => {
    if (!caseInfo) return
    setInvestigationError('')
    try {
      const response = await startInvestigation({ user_id: user.id, case_id: caseInfo.id })
      if (response?.investigation) {
        setInvestigation(response.investigation)
      } else {
        setInvestigationError('Investigation details were not returned. Please try again.')
      }
    } catch {
      setInvestigationError('Investigation progress is unavailable. Retry to enable evidence collection.')
    }
  }

  const handleCollect = async (evidenceId) => {
    if (!investigation?.id) return
    setCollectingIds((ids) => [...ids, evidenceId])
    setEvidenceError('')
    try {
      const response = await collectEvidence(investigation.id, evidenceId)
      if (response?.collected) {
        setCollectedIds((ids) => ids.includes(evidenceId) ? ids : [...ids, evidenceId])
      }
    } catch {
      setEvidenceError('This evidence could not be recorded. Please try again.')
    } finally {
      setCollectingIds((ids) => ids.filter((id) => id !== evidenceId))
    }
  }

  return (
    <section className="evidence-page">
      <div className="evidence-page-navigation">
        <Link to={`/investigation/${caseId}`}>&larr; Investigation workspace</Link>
        <Link to={`/investigation/${caseId}/clues`}>Clues</Link>
      </div>

      {loading && <p className="evidence-page-message" role="status">Loading evidence...</p>}

      {!loading && error && (
        <div className="evidence-page-message evidence-page-feedback" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && notFound && (
        <div className="evidence-page-message" role="status">
          <h1>Case not found</h1>
          <p>There is no available case file for this evidence.</p>
        </div>
      )}

      {!loading && !error && caseInfo && (
        <>
          <header className="evidence-page-header">
            <p className="eyebrow">{caseInfo.case_number || 'Investigation'}</p>
            <h1>{caseInfo.title}</h1>
            <p>{caseInfo.briefing || caseInfo.description || 'No case briefing is available.'}</p>
            <div className="evidence-page-progress" aria-live="polite">
              <span>Investigation: <strong>{investigation?.status || 'Unavailable'}</strong></span>
              {investigation?.current_stage && (
                <span>Current stage: <strong>{investigation.current_stage.replaceAll('_', ' ')}</strong></span>
              )}
              <span>Collected here: <strong>{collectedIds.length} / {evidenceItems.length}</strong></span>
            </div>
          </header>

          {investigationError && (
            <div className="evidence-page-inline-error" role="alert">
              <p>{investigationError}</p>
              <button className="secondary-button" type="button" onClick={retryInvestigation}>
                Retry investigation
              </button>
            </div>
          )}
          {evidenceError && (
            <div className="evidence-page-inline-error" role="alert">
              <p>{evidenceError}</p>
              {evidenceItems.length === 0 && (
                <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
                  Reload evidence
                </button>
              )}
            </div>
          )}

          {!evidenceError && evidenceItems.length === 0 && (
            <p className="evidence-page-message evidence-page-empty">No evidence is available for this case yet.</p>
          )}

          {evidenceItems.length > 0 && (
            <>
              <div className="evidence-page-list-heading">
                <div>
                  <p className="eyebrow">Evidence inventory</p>
                  <h2>Case evidence</h2>
                </div>
                <span>{evidenceItems.length} {evidenceItems.length === 1 ? 'item' : 'items'}</span>
              </div>

              <div className="evidence-page-grid">
                {evidenceItems.map((item) => {
                  const isCollected = collectedIds.includes(item.id)
                  const isCollecting = collectingIds.includes(item.id)
                  return (
                    <article className="evidence-page-card" key={item.id}>
                      <div className="evidence-page-card-meta">
                        <span>{item.type || 'Evidence'}</span>
                        <span className={isCollected ? 'evidence-page-state is-collected' : 'evidence-page-state'}>
                          {isCollected ? 'Collected' : 'Not collected'}
                        </span>
                      </div>
                      <h2>{item.name || 'Untitled evidence'}</h2>
                      <p>{item.description || 'No additional details are available.'}</p>
                      {item.related_info && <p className="evidence-page-related">{item.related_info}</p>}
                      {item.location && (
                        <dl><div><dt>Location</dt><dd>{item.location}</dd></div></dl>
                      )}
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={!investigation?.id || isCollected || isCollecting}
                        onClick={() => handleCollect(item.id)}
                      >
                        {isCollecting ? 'Recording...' : isCollected ? 'Collected' : 'Collect evidence'}
                      </button>
                    </article>
                  )
                })}
              </div>
              <p className="evidence-page-note">
                Collection status shown here reflects actions confirmed during this visit. The current API does not return previously collected evidence IDs.
              </p>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default EvidencePage