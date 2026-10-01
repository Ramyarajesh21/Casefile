import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCaseById, fetchCaseWitnesses } from '../services/caseService'
import { interviewWitness, startInvestigation } from '../services/investigationService'
import './WitnessesPage.css'

function WitnessesPage() {
  const { caseId } = useParams()
  const { user } = useAuth()
  const [caseInfo, setCaseInfo] = useState(null)
  const [investigation, setInvestigation] = useState(null)
  const [witnesses, setWitnesses] = useState([])
  const [interviewingIds, setInterviewingIds] = useState([])
  const [interviewAnswers, setInterviewAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [witnessError, setWitnessError] = useState('')
  const [investigationError, setInvestigationError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadWitnessBoard = async () => {
      setLoading(true)
      setError('')
      setWitnessError('')
      setInvestigationError('')
      setNotFound(false)
      setCaseInfo(null)
      setInvestigation(null)
      setWitnesses([])
      setInterviewAnswers({})

      try {
        const caseResponse = await fetchCaseById(caseId)
        const loadedCase = caseResponse?.case
        if (!loadedCase) {
          if (isCurrent) setNotFound(true)
          return
        }
        if (isCurrent) setCaseInfo(loadedCase)

        const [witnessResult, investigationResult] = await Promise.allSettled([
          fetchCaseWitnesses(caseId),
          startInvestigation({ user_id: user.id, case_id: loadedCase.id }),
        ])

        if (!isCurrent) return

        if (witnessResult.status === 'fulfilled') {
          setWitnesses(Array.isArray(witnessResult.value?.witnesses) ? witnessResult.value.witnesses : [])
        } else {
          setWitnessError('Witness information could not be loaded. Please retry.')
        }

        if (investigationResult.status === 'fulfilled' && investigationResult.value?.investigation) {
          setInvestigation(investigationResult.value.investigation)
        } else {
          setInvestigationError('Investigation progress is unavailable. Retry to enable interviews.')
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

    loadWitnessBoard()
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
      setInvestigationError('Investigation progress is unavailable. Retry to enable interviews.')
    }
  }

  const handleInterview = async (witnessId) => {
    if (!investigation?.id) return
    setInterviewingIds((ids) => [...ids, witnessId])
    setWitnessError('')
    try {
      const response = await interviewWitness(investigation.id, witnessId, { question: 'What did you see?' })
      if (response?.interview) {
        setInterviewAnswers((answers) => ({ ...answers, [witnessId]: response.interview }))
        setWitnesses((current) => current.map((witness) => (
          witness.id === witnessId ? { ...witness, interview_status: 'completed' } : witness
        )))
      } else {
        setWitnessError('The interview response was unavailable. Please try again.')
      }
    } catch {
      setWitnessError('This witness could not be interviewed. Please try again.')
    } finally {
      setInterviewingIds((ids) => ids.filter((id) => id !== witnessId))
    }
  }

  return (
    <section className="witnesses-page">
      <div className="witnesses-page-navigation">
        <Link to={`/investigation/${caseId}`}>&larr; Investigation workspace</Link>
        <Link to={`/investigation/${caseId}/clues`}>Clues</Link>
      </div>

      {loading && <p className="witnesses-page-message" role="status">Loading witnesses...</p>}

      {!loading && error && (
        <div className="witnesses-page-message witnesses-page-feedback" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && notFound && (
        <div className="witnesses-page-message" role="status">
          <h1>Case not found</h1>
          <p>There is no available case file for these witnesses.</p>
        </div>
      )}

      {!loading && !error && caseInfo && (
        <>
          <header className="witnesses-page-header">
            <p className="eyebrow">{caseInfo.case_number || 'Investigation'}</p>
            <h1>{caseInfo.title}</h1>
            <p>{caseInfo.briefing || caseInfo.description || 'No case briefing is available.'}</p>
            <div className="witnesses-page-progress" aria-live="polite">
              <span>Investigation: <strong>{investigation?.status || 'Unavailable'}</strong></span>
              {investigation?.current_stage && (
                <span>Current stage: <strong>{investigation.current_stage.replaceAll('_', ' ')}</strong></span>
              )}
              <span>Witnesses interviewed: <strong>{witnesses.filter((witness) => witness.interview_status === 'completed').length} / {witnesses.length}</strong></span>
            </div>
          </header>

          {investigationError && (
            <div className="witnesses-page-inline-error" role="alert">
              <p>{investigationError}</p>
              <button className="secondary-button" type="button" onClick={retryInvestigation}>
                Retry investigation
              </button>
            </div>
          )}
          {witnessError && <p className="witnesses-page-inline-error" role="alert">{witnessError}</p>}

          {!witnessError && witnesses.length === 0 && (
            <p className="witnesses-page-message witnesses-page-empty">No witnesses are available for this case yet.</p>
          )}

          {witnesses.length > 0 && (
            <>
              <div className="witnesses-page-list-heading">
                <div>
                  <p className="eyebrow">People connected to the case</p>
                  <h2>Witnesses</h2>
                </div>
                <span>{witnesses.length} {witnesses.length === 1 ? 'witness' : 'witnesses'}</span>
              </div>

              <div className="witnesses-page-grid">
                {witnesses.map((witness) => {
                  const interview = interviewAnswers[witness.id]
                  const isInterviewing = interviewingIds.includes(witness.id)
                  const isCompleted = witness.interview_status === 'completed'
                  return (
                    <article className="witnesses-page-card" key={witness.id}>
                      <div className="witnesses-page-card-meta">
                        <span>Witness #{witness.id}</span>
                        <span className={isCompleted ? 'witnesses-page-status is-complete' : 'witnesses-page-status'}>
                          {witness.interview_status || 'Status unavailable'}
                        </span>
                      </div>
                      <h2>{witness.name || 'Unnamed witness'}</h2>
                      {(witness.occupation || witness.age != null) && (
                        <p className="witnesses-page-role">
                          {[witness.occupation, witness.age != null ? `Age ${witness.age}` : null].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <dl>
                        {witness.relationship_to_victim && <div><dt>Connection</dt><dd>{witness.relationship_to_victim}</dd></div>}
                        {witness.location && <div><dt>Interview location</dt><dd>{witness.location}</dd></div>}
                        {witness.reliability && <div><dt>Reliability</dt><dd>{witness.reliability}</dd></div>}
                      </dl>
                      {interview?.answer && (
                        <div className="witnesses-page-statement">
                          <p className="witnesses-page-question">{interview.question}</p>
                          <p>{interview.answer}</p>
                        </div>
                      )}
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={!investigation?.id || isInterviewing}
                        onClick={() => handleInterview(witness.id)}
                      >
                        {isInterviewing ? 'Interviewing...' : isCompleted ? 'Interview again' : 'Interview witness'}
                      </button>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default WitnessesPage