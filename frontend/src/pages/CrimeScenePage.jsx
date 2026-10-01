import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCaseById, fetchCaseClues } from '../services/caseService'
import { discoverClue, startInvestigation } from '../services/investigationService'
import './CrimeScenePage.css'

function CrimeScenePage() {
  const { caseId } = useParams()
  const { user } = useAuth()
  const [caseInfo, setCaseInfo] = useState(null)
  const [investigation, setInvestigation] = useState(null)
  const [clues, setClues] = useState([])
  const [discoveredClueIds, setDiscoveredClueIds] = useState([])
  const [examiningClueIds, setExaminingClueIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [caseError, setCaseError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [clueError, setClueError] = useState('')
  const [investigationError, setInvestigationError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadScene = async () => {
      setLoading(true)
      setCaseError('')
      setNotFound(false)
      setClueError('')
      setInvestigationError('')
      setCaseInfo(null)
      setInvestigation(null)
      setClues([])
      setDiscoveredClueIds([])

      try {
        const caseResponse = await fetchCaseById(caseId)
        const loadedCase = caseResponse?.case
        if (!loadedCase) {
          if (isCurrent) setNotFound(true)
          return
        }
        if (isCurrent) setCaseInfo(loadedCase)

        const [clueResult, investigationResult] = await Promise.allSettled([
          fetchCaseClues(caseId),
          startInvestigation({ user_id: user.id, case_id: loadedCase.id }),
        ])

        if (!isCurrent) return

        if (clueResult.status === 'fulfilled') {
          setClues(Array.isArray(clueResult.value?.clues) ? clueResult.value.clues : [])
        } else {
          setClueError('Scene clues are unavailable right now.')
        }

        if (investigationResult.status === 'fulfilled' && investigationResult.value?.investigation) {
          setInvestigation(investigationResult.value.investigation)
        } else {
          setInvestigationError('Investigation progress is unavailable. Try again to enable clue discovery.')
        }
      } catch (requestError) {
        if (isCurrent) {
          if (requestError.response?.status === 404) {
            setNotFound(true)
          } else {
            setCaseError('The crime scene could not be loaded. Please try again.')
          }
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadScene()
    return () => {
      isCurrent = false
    }
  }, [caseId, retryCount, user.id])

  const retryInvestigation = async () => {
    if (!caseInfo) return
    setInvestigationError('')
    try {
      const response = await startInvestigation({ user_id: user.id, case_id: caseInfo.id })
      if (response?.investigation) setInvestigation(response.investigation)
      else setInvestigationError('Investigation details were not returned. Please try again.')
    } catch {
      setInvestigationError('Investigation progress is unavailable. Try again to enable clue discovery.')
    }
  }

  const handleDiscoverClue = async (clueId) => {
    if (!investigation?.id) return
    setExaminingClueIds((ids) => [...ids, clueId])
    setClueError('')
    try {
      const response = await discoverClue(investigation.id, clueId)
      if (response?.discovered) {
        setDiscoveredClueIds((ids) => ids.includes(clueId) ? ids : [...ids, clueId])
      }
    } catch {
      setClueError('This clue could not be recorded. Please try again.')
    } finally {
      setExaminingClueIds((ids) => ids.filter((id) => id !== clueId))
    }
  }

  return (
    <section className="crime-scene">
      <div className="crime-scene-navigation">
        <Link to={`/investigation/${caseId}`}>&larr; Investigation workspace</Link>
        <Link to={`/cases/${caseId}`}>Case details</Link>
      </div>

      {loading && <p className="crime-scene-message" role="status">Loading crime scene...</p>}

      {!loading && caseError && (
        <div className="crime-scene-message crime-scene-feedback" role="alert">
          <p>{caseError}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !caseError && notFound && (
        <div className="crime-scene-message" role="status">
          <h1>Crime scene unavailable</h1>
          <p>There is no available case file for this scene.</p>
        </div>
      )}

      {!loading && !caseError && caseInfo && (
        <>
          <header className="crime-scene-header">
            <p className="eyebrow">{caseInfo.case_number || 'Investigation'}</p>
            <h1>{caseInfo.title}</h1>
            <p className="crime-scene-subtitle">Crime scene examination</p>
            <div className="crime-scene-location">
              <span className="crime-scene-location-label">Location</span>
              <strong>{caseInfo.location || 'Location details unavailable'}</strong>
              {caseInfo.incident_date && <span>{caseInfo.incident_date}{caseInfo.incident_time ? `, ${caseInfo.incident_time}` : ''}</span>}
            </div>
          </header>

          <div className="crime-scene-layout">
            <section className="crime-scene-description">
              <p className="eyebrow">Scene briefing</p>
              <h2>On arrival</h2>
              <p>{caseInfo.briefing || caseInfo.description || 'No scene description is available yet.'}</p>

              {caseInfo.known_facts && (
                <div className="crime-scene-observations">
                  <h3>Known details</h3>
                  <p>{caseInfo.known_facts}</p>
                </div>
              )}

              <dl className="crime-scene-facts">
                {caseInfo.victim_name && <div><dt>Victim</dt><dd>{caseInfo.victim_name}</dd></div>}
                {caseInfo.crime_type && <div><dt>Incident type</dt><dd>{caseInfo.crime_type}</dd></div>}
                {caseInfo.status && <div><dt>Case status</dt><dd>{caseInfo.status}</dd></div>}
              </dl>
            </section>

            <section className="crime-scene-clues" aria-labelledby="crime-scene-clues-title">
              <div className="crime-scene-clues-heading">
                <div>
                  <p className="eyebrow">Examination</p>
                  <h2 id="crime-scene-clues-title">Observable details</h2>
                </div>
                <p className="crime-scene-clue-count" aria-live="polite">
                  {discoveredClueIds.length} / {clues.length} examined here
                </p>
              </div>

              {investigationError && (
                <div className="crime-scene-inline-error" role="alert">
                  <p>{investigationError}</p>
                  <button className="secondary-button" type="button" onClick={retryInvestigation}>
                    Retry
                  </button>
                </div>
              )}
              {clueError && <p className="crime-scene-inline-error" role="alert">{clueError}</p>}

              {!clueError && clues.length === 0 && !loading && (
                <p className="crime-scene-empty">No scene clues are available for this case yet.</p>
              )}

              {clues.length > 0 && (
                <div className="crime-scene-clue-list">
                  {clues.map((clue) => {
                    const isDiscovered = discoveredClueIds.includes(clue.id)
                    const isExamining = examiningClueIds.includes(clue.id)
                    return (
                      <article className="crime-scene-clue" key={clue.id}>
                        <div className="crime-scene-clue-topline">
                          <span className="crime-scene-clue-type">{clue.type || 'Clue'}</span>
                          <span className={`crime-scene-discovery${isDiscovered ? ' is-discovered' : ''}`}>
                            {isDiscovered ? 'Examined' : 'Unexamined'}
                          </span>
                        </div>
                        <h3>{clue.name}</h3>
                        <p>{clue.description}</p>
                        <div className="crime-scene-clue-meta">
                          {clue.location && <span>{clue.location}</span>}
                          {clue.importance && <span>{clue.importance} importance</span>}
                        </div>
                        <button
                          className="secondary-button"
                          type="button"
                          disabled={!investigation?.id || isDiscovered || isExamining}
                          onClick={() => handleDiscoverClue(clue.id)}
                        >
                          {isExamining ? 'Recording...' : isDiscovered ? 'Examined' : 'Examine clue'}
                        </button>
                      </article>
                    )
                  })}
                </div>
              )}

              <p className="crime-scene-progress-note">
                Examined status is confirmed by the discovery API during this visit. Previously discovered clues are not included in the current investigation read response.
              </p>
            </section>
          </div>
        </>
      )}
    </section>
  )
}

export default CrimeScenePage