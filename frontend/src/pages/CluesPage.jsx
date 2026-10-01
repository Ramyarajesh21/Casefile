import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCaseById, fetchCaseClues } from '../services/caseService'
import { discoverClue, startInvestigation } from '../services/investigationService'
import './CluesPage.css'

function CluesPage() {
  const { caseId } = useParams()
  const { user } = useAuth()
  const [caseInfo, setCaseInfo] = useState(null)
  const [investigation, setInvestigation] = useState(null)
  const [clues, setClues] = useState([])
  const [discoveredIds, setDiscoveredIds] = useState([])
  const [discoveringIds, setDiscoveringIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [clueError, setClueError] = useState('')
  const [investigationError, setInvestigationError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadClueBoard = async () => {
      setLoading(true)
      setError('')
      setClueError('')
      setInvestigationError('')
      setNotFound(false)
      setCaseInfo(null)
      setInvestigation(null)
      setClues([])
      setDiscoveredIds([])

      try {
        const caseResponse = await fetchCaseById(caseId)
        const loadedCase = caseResponse?.case
        if (!loadedCase) {
          if (isCurrent) setNotFound(true)
          return
        }
        if (isCurrent) setCaseInfo(loadedCase)

        const [cluesResult, investigationResult] = await Promise.allSettled([
          fetchCaseClues(caseId),
          startInvestigation({ user_id: user.id, case_id: loadedCase.id }),
        ])

        if (!isCurrent) return

        if (cluesResult.status === 'fulfilled') {
          setClues(Array.isArray(cluesResult.value?.clues) ? cluesResult.value.clues : [])
        } else {
          setClueError('Clues could not be loaded. Please retry.')
        }

        if (investigationResult.status === 'fulfilled' && investigationResult.value?.investigation) {
          setInvestigation(investigationResult.value.investigation)
        } else {
          setInvestigationError('Investigation progress is unavailable. Retry to enable clue discovery.')
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

    loadClueBoard()
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
      setInvestigationError('Investigation progress is unavailable. Retry to enable clue discovery.')
    }
  }

  const handleDiscover = async (clueId) => {
    if (!investigation?.id) return
    setDiscoveringIds((ids) => [...ids, clueId])
    setClueError('')
    try {
      const response = await discoverClue(investigation.id, clueId)
      if (response?.discovered) {
        setDiscoveredIds((ids) => ids.includes(clueId) ? ids : [...ids, clueId])
      }
    } catch {
      setClueError('The clue discovery could not be recorded. Please try again.')
    } finally {
      setDiscoveringIds((ids) => ids.filter((id) => id !== clueId))
    }
  }

  return (
    <section className="clues-page">
      <div className="clues-page-navigation">
        <Link to={`/investigation/${caseId}`}>&larr; Investigation workspace</Link>
        <Link to={`/investigation/${caseId}/scene`}>Crime scene</Link>
      </div>

      {loading && <p className="clues-page-message" role="status">Loading clues...</p>}

      {!loading && error && (
        <div className="clues-page-message clues-page-feedback" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && notFound && (
        <div className="clues-page-message" role="status">
          <h1>Case not found</h1>
          <p>There is no available case file for these clues.</p>
        </div>
      )}

      {!loading && !error && caseInfo && (
        <>
          <header className="clues-page-header">
            <p className="eyebrow">{caseInfo.case_number || 'Investigation'}</p>
            <h1>{caseInfo.title}</h1>
            <p>{caseInfo.briefing || caseInfo.description || 'No case briefing is available.'}</p>
            <div className="clues-page-progress" aria-live="polite">
              <span>Investigation: <strong>{investigation?.status || 'Unavailable'}</strong></span>
              {investigation?.current_stage && (
                <span>Current stage: <strong>{investigation.current_stage.replaceAll('_', ' ')}</strong></span>
              )}
              <span>Clues examined here: <strong>{discoveredIds.length} / {clues.length}</strong></span>
            </div>
          </header>

          {investigationError && (
            <div className="clues-page-inline-error" role="alert">
              <p>{investigationError}</p>
              <button className="secondary-button" type="button" onClick={retryInvestigation}>
                Retry investigation
              </button>
            </div>
          )}
          {clueError && (
            <div className="clues-page-inline-error" role="alert">
              <p>{clueError}</p>
              {clues.length === 0 && (
                <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
                  Reload clues
                </button>
              )}
            </div>
          )}

          {!clueError && clues.length === 0 && (
            <p className="clues-page-message clues-page-empty">No clues are available for this case yet.</p>
          )}

          {clues.length > 0 && (
            <>
              <div className="clues-page-list-heading">
                <div>
                  <p className="eyebrow">Evidence board</p>
                  <h2>Available clues</h2>
                </div>
                <span>{clues.length} {clues.length === 1 ? 'clue' : 'clues'}</span>
              </div>

              <div className="clues-page-grid">
                {clues.map((clue) => {
                  const isDiscovered = discoveredIds.includes(clue.id)
                  const isDiscovering = discoveringIds.includes(clue.id)
                  return (
                    <article className="clues-page-card" key={clue.id}>
                      <div className="clues-page-card-meta">
                        <span>{clue.type || 'Clue'}</span>
                        <span className={isDiscovered ? 'clues-page-state is-discovered' : 'clues-page-state'}>
                          {isDiscovered ? 'Discovered' : 'Undiscovered'}
                        </span>
                      </div>
                      <h2>{clue.name || 'Untitled clue'}</h2>
                      <p>{clue.description || 'No additional details are available.'}</p>
                      <dl>
                        {clue.location && <div><dt>Location</dt><dd>{clue.location}</dd></div>}
                        {clue.importance && <div><dt>Importance</dt><dd>{clue.importance}</dd></div>}
                        {clue.discovery_condition && <div><dt>Condition</dt><dd>{clue.discovery_condition}</dd></div>}
                      </dl>
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={!investigation?.id || isDiscovered || isDiscovering}
                        onClick={() => handleDiscover(clue.id)}
                      >
                        {isDiscovering ? 'Recording...' : isDiscovered ? 'Discovered' : 'Discover clue'}
                      </button>
                    </article>
                  )
                })}
              </div>
              <p className="clues-page-note">
                The current API does not return previously discovered clue IDs, so discovery state shown here reflects actions confirmed during this visit.
              </p>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default CluesPage