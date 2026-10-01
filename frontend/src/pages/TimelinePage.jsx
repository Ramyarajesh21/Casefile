import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCaseById, fetchCaseTimeline } from '../services/caseService'
import { startInvestigation } from '../services/investigationService'
import './TimelinePage.css'

function TimelinePage() {
  const { caseId } = useParams()
  const { user } = useAuth()
  const [caseInfo, setCaseInfo] = useState(null)
  const [investigation, setInvestigation] = useState(null)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timelineError, setTimelineError] = useState('')
  const [investigationError, setInvestigationError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadTimeline = async () => {
      setLoading(true)
      setError('')
      setTimelineError('')
      setInvestigationError('')
      setNotFound(false)
      setCaseInfo(null)
      setInvestigation(null)
      setEvents([])

      try {
        const caseResponse = await fetchCaseById(caseId)
        const loadedCase = caseResponse?.case
        if (!loadedCase) {
          if (isCurrent) setNotFound(true)
          return
        }
        if (isCurrent) setCaseInfo(loadedCase)

        const [timelineResult, investigationResult] = await Promise.allSettled([
          fetchCaseTimeline(caseId),
          startInvestigation({ user_id: user.id, case_id: loadedCase.id }),
        ])

        if (!isCurrent) return

        if (timelineResult.status === 'fulfilled') {
          setEvents(Array.isArray(timelineResult.value?.timeline) ? timelineResult.value.timeline : [])
        } else {
          setTimelineError('Timeline events could not be loaded. Please retry.')
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

    loadTimeline()
    return () => {
      isCurrent = false
    }
  }, [caseId, retryCount, user.id])

  const orderedEvents = events
    .map((event, index) => ({ event, index, timestamp: Date.parse(event.event_time || '') }))
    .sort((left, right) => {
      const leftHasTime = Number.isFinite(left.timestamp)
      const rightHasTime = Number.isFinite(right.timestamp)
      if (leftHasTime && rightHasTime) return left.timestamp - right.timestamp || left.index - right.index
      if (leftHasTime) return -1
      if (rightHasTime) return 1
      return left.index - right.index
    })

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
    <section className="timeline-page">
      <div className="timeline-page-navigation">
        <Link to={`/investigation/${caseId}`}>&larr; Investigation workspace</Link>
        <Link to={`/investigation/${caseId}/suspects`}>Suspects</Link>
      </div>

      {loading && <p className="timeline-page-message" role="status">Loading timeline...</p>}

      {!loading && error && (
        <div className="timeline-page-message timeline-page-feedback" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && notFound && (
        <div className="timeline-page-message" role="status">
          <h1>Case not found</h1>
          <p>There is no available case file for this timeline.</p>
        </div>
      )}

      {!loading && !error && caseInfo && (
        <>
          <header className="timeline-page-header">
            <p className="eyebrow">{caseInfo.case_number || 'Investigation'}</p>
            <h1>{caseInfo.title}</h1>
            <p>{caseInfo.briefing || caseInfo.description || 'No case briefing is available.'}</p>
            <div className="timeline-page-progress" aria-live="polite">
              <span>Investigation: <strong>{investigation?.status || 'Unavailable'}</strong></span>
              {investigation?.current_stage && (
                <span>Current stage: <strong>{investigation.current_stage.replaceAll('_', ' ')}</strong></span>
              )}
              <span>Recorded events: <strong>{events.length}</strong></span>
            </div>
          </header>

          {investigationError && (
            <div className="timeline-page-inline-error" role="alert">
              <p>{investigationError}</p>
              <button className="secondary-button" type="button" onClick={retryInvestigation}>
                Retry investigation
              </button>
            </div>
          )}

          {timelineError && (
            <div className="timeline-page-message timeline-page-feedback" role="alert">
              <p>{timelineError}</p>
              <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
                Reload timeline
              </button>
            </div>
          )}

          {!timelineError && events.length === 0 && (
            <p className="timeline-page-message timeline-page-empty">No timeline events are available for this case yet.</p>
          )}

          {orderedEvents.length > 0 && !timelineError && (
            <>
              <div className="timeline-page-list-heading">
                <div>
                  <p className="eyebrow">Sequence of events</p>
                  <h2>Case timeline</h2>
                </div>
                {caseInfo.location && <span>{caseInfo.location}</span>}
              </div>

              <ol className="timeline-event-list">
                {orderedEvents.map(({ event }, index) => (
                  <li className="timeline-event" key={event.id ?? `${event.event_time || 'event'}-${index}`}>
                    <span className="timeline-event-marker" aria-hidden="true" />
                    <article className="timeline-event-content">
                      {event.event_time && <p className="timeline-event-time">{event.event_time}</p>}
                      {event.type && <p className="timeline-event-type">{event.type}</p>}
                      <h3>{event.title || 'Untitled event'}</h3>
                      {event.description && <p className="timeline-event-description">{event.description}</p>}
                    </article>
                  </li>
                ))}
              </ol>
              <p className="timeline-page-note">
                Events with parseable times are shown chronologically. Events without a usable time follow in the order returned by the case API.
              </p>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default TimelinePage