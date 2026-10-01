import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCaseById, fetchCaseSuspects } from '../services/caseService'
import { startInvestigation } from '../services/investigationService'
import './SuspectsPage.css'

function SuspectsPage() {
  const { caseId } = useParams()
  const { user } = useAuth()
  const [caseInfo, setCaseInfo] = useState(null)
  const [investigation, setInvestigation] = useState(null)
  const [suspects, setSuspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [suspectError, setSuspectError] = useState('')
  const [investigationError, setInvestigationError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadSuspectBoard = async () => {
      setLoading(true)
      setError('')
      setSuspectError('')
      setInvestigationError('')
      setNotFound(false)
      setCaseInfo(null)
      setInvestigation(null)
      setSuspects([])

      try {
        const caseResponse = await fetchCaseById(caseId)
        const loadedCase = caseResponse?.case
        if (!loadedCase) {
          if (isCurrent) setNotFound(true)
          return
        }
        if (isCurrent) setCaseInfo(loadedCase)

        const [suspectResult, investigationResult] = await Promise.allSettled([
          fetchCaseSuspects(caseId),
          startInvestigation({ user_id: user.id, case_id: loadedCase.id }),
        ])

        if (!isCurrent) return

        if (suspectResult.status === 'fulfilled') {
          setSuspects(Array.isArray(suspectResult.value?.suspects) ? suspectResult.value.suspects : [])
        } else {
          setSuspectError('Suspect information could not be loaded. Please retry.')
        }

        if (investigationResult.status === 'fulfilled' && investigationResult.value?.investigation) {
          setInvestigation(investigationResult.value.investigation)
        } else {
          setInvestigationError('Investigation progress is unavailable.')
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

    loadSuspectBoard()
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
      setInvestigationError('Investigation progress is unavailable.')
    }
  }

  return (
    <section className="suspects-page">
      <div className="suspects-page-navigation">
        <Link to={`/investigation/${caseId}`}>&larr; Investigation workspace</Link>
        <Link to={`/investigation/${caseId}/witnesses`}>Witnesses</Link>
      </div>

      {loading && <p className="suspects-page-message" role="status">Loading suspects...</p>}

      {!loading && error && (
        <div className="suspects-page-message suspects-page-feedback" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && notFound && (
        <div className="suspects-page-message" role="status">
          <h1>Case not found</h1>
          <p>There is no available case file for these suspects.</p>
        </div>
      )}

      {!loading && !error && caseInfo && (
        <>
          <header className="suspects-page-header">
            <p className="eyebrow">{caseInfo.case_number || 'Investigation'}</p>
            <h1>{caseInfo.title}</h1>
            <p>{caseInfo.briefing || caseInfo.description || 'No case briefing is available.'}</p>
            <div className="suspects-page-progress" aria-live="polite">
              <span>Investigation: <strong>{investigation?.status || 'Unavailable'}</strong></span>
              {investigation?.current_stage && (
                <span>Current stage: <strong>{investigation.current_stage.replaceAll('_', ' ')}</strong></span>
              )}
              <span>People under review: <strong>{suspects.length}</strong></span>
            </div>
          </header>

          {investigationError && (
            <div className="suspects-page-inline-error" role="alert">
              <p>{investigationError}</p>
              <button className="secondary-button" type="button" onClick={retryInvestigation}>
                Retry investigation
              </button>
            </div>
          )}
          {suspectError && (
            <div className="suspects-page-inline-error" role="alert">
              <p>{suspectError}</p>
              {suspects.length === 0 && (
                <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
                  Reload suspects
                </button>
              )}
            </div>
          )}

          {!suspectError && suspects.length === 0 && (
            <p className="suspects-page-message suspects-page-empty">No suspects are available for this case yet.</p>
          )}

          {suspects.length > 0 && (
            <>
              <div className="suspects-page-list-heading">
                <div>
                  <p className="eyebrow">Persons of interest</p>
                  <h2>Suspect profiles</h2>
                </div>
                <span>{suspects.length} {suspects.length === 1 ? 'profile' : 'profiles'}</span>
              </div>

              <div className="suspects-page-grid">
                {suspects.map((suspect) => (
                  <article className="suspects-page-card" key={suspect.id}>
                    <div className="suspects-page-card-meta">
                      <span>Suspect #{suspect.id}</span>
                      {suspect.age != null && <span>Age {suspect.age}</span>}
                    </div>
                    <h2>{suspect.name || 'Unnamed suspect'}</h2>
                    {(suspect.occupation || suspect.relationship_to_victim) && (
                      <p className="suspects-page-role">
                        {[suspect.occupation, suspect.relationship_to_victim].filter(Boolean).join(' · ')}
                      </p>
                    )}

                    <dl>
                      {suspect.possible_motive && <div><dt>Possible motive</dt><dd>{suspect.possible_motive}</dd></div>}
                      {suspect.alibi && <div><dt>Alibi</dt><dd>{suspect.alibi}</dd></div>}
                      {suspect.known_information && <div><dt>Known information</dt><dd>{suspect.known_information}</dd></div>}
                    </dl>
                  </article>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default SuspectsPage