import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCaseById, fetchCaseClues, fetchCaseEvidence, fetchCaseSuspects } from '../services/caseService'
import { startInvestigation, submitAccusation } from '../services/investigationService'
import './AccusationPage.css'

function AccusationPage() {
  const { caseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const submittingRef = useRef(false)
  const [caseInfo, setCaseInfo] = useState(null)
  const [investigation, setInvestigation] = useState(null)
  const [suspects, setSuspects] = useState([])
  const [clues, setClues] = useState([])
  const [evidenceItems, setEvidenceItems] = useState([])
  const [formData, setFormData] = useState({
    culprit: '',
    motive: '',
    method: '',
    evidence: '',
    explanation: '',
    confirmed: false,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [dataError, setDataError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadAccusationWorkspace = async () => {
      setLoading(true)
      setError('')
      setDataError('')
      setSubmitError('')
      setNotFound(false)
      setCaseInfo(null)
      setInvestigation(null)
      setSuspects([])
      setClues([])
      setEvidenceItems([])

      try {
        const caseResponse = await fetchCaseById(caseId)
        const loadedCase = caseResponse?.case
        if (!loadedCase) {
          if (isCurrent) setNotFound(true)
          return
        }
        if (isCurrent) setCaseInfo(loadedCase)

        const [suspectResult, clueResult, evidenceResult, investigationResult] = await Promise.allSettled([
          fetchCaseSuspects(caseId),
          fetchCaseClues(caseId),
          fetchCaseEvidence(caseId),
          startInvestigation({ user_id: user.id, case_id: loadedCase.id }),
        ])

        if (!isCurrent) return

        const warnings = []
        if (suspectResult.status === 'fulfilled') {
          setSuspects(Array.isArray(suspectResult.value?.suspects) ? suspectResult.value.suspects : [])
        } else {
          warnings.push('suspect list')
        }
        if (clueResult.status === 'fulfilled') {
          setClues(Array.isArray(clueResult.value?.clues) ? clueResult.value.clues : [])
        } else {
          warnings.push('clues')
        }
        if (evidenceResult.status === 'fulfilled') {
          setEvidenceItems(Array.isArray(evidenceResult.value?.evidence) ? evidenceResult.value.evidence : [])
        } else {
          warnings.push('evidence')
        }
        if (investigationResult.status === 'fulfilled' && investigationResult.value?.investigation) {
          setInvestigation(investigationResult.value.investigation)
        } else {
          warnings.push('investigation status')
        }
        if (warnings.length) {
          setDataError(`Some case information could not be loaded: ${warnings.join(', ')}.`)
        }
      } catch (requestError) {
        if (isCurrent) {
          if (requestError.response?.status === 404) {
            setNotFound(true)
          } else {
            setError('The accusation workspace could not be loaded. Please try again.')
          }
        }
      } finally {
        if (isCurrent) setLoading(false)
      }
    }

    loadAccusationWorkspace()
    return () => {
      isCurrent = false
    }
  }, [caseId, retryCount, user.id])

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setSubmitError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submittingRef.current || submitting || !formData.confirmed || !investigation?.id) return

    submittingRef.current = true
    setSubmitting(true)
    setSubmitError('')
    try {
      await submitAccusation(investigation.id, {
        culprit: formData.culprit,
        motive: formData.motive.trim(),
        method: formData.method.trim(),
        evidence: formData.evidence.trim(),
        explanation: formData.explanation.trim(),
      })
      navigate(`/investigation/${caseId}/result`, { replace: true })
    } catch {
      setSubmitError('The accusation could not be submitted. Check your connection and try again.')
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  const isCompleted = investigation?.status === 'completed'
  const hasSuspects = suspects.length > 0

  return (
    <section className="accusation-page">
      <div className="accusation-page-navigation">
        <Link to={`/investigation/${caseId}`}>&larr; Investigation workspace</Link>
        <Link to={`/investigation/${caseId}/deduction`}>Review deductions</Link>
      </div>

      {loading && <p className="accusation-page-message" role="status">Loading accusation workspace...</p>}

      {!loading && error && (
        <div className="accusation-page-message accusation-page-feedback" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && notFound && (
        <div className="accusation-page-message" role="status">
          <h1>Case not found</h1>
          <p>There is no available case file for this accusation.</p>
        </div>
      )}

      {!loading && !error && caseInfo && (
        <>
          <header className="accusation-page-header">
            <p className="eyebrow">{caseInfo.case_number || 'Final review'}</p>
            <h1>Final Accusation</h1>
            <h2>{caseInfo.title}</h2>
            <p>{caseInfo.briefing || caseInfo.description || 'No case briefing is available.'}</p>
            <div className="accusation-page-progress" aria-live="polite">
              <span>Investigation: <strong>{investigation?.status || 'Unavailable'}</strong></span>
              {investigation?.current_stage && (
                <span>Current stage: <strong>{investigation.current_stage.replaceAll('_', ' ')}</strong></span>
              )}
              {investigation?.score != null && <span>Current score: <strong>{investigation.score}</strong></span>}
            </div>
          </header>

          {dataError && (
            <div className="accusation-page-data-warning" role="status">
              <p>{dataError}</p>
              <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
                Reload case information
              </button>
            </div>
          )}

          {isCompleted ? (
            <div className="accusation-page-completed" role="status">
              <p>This investigation is already complete.</p>
              <Link className="primary-button" to={`/investigation/${caseId}/result`}>View case result</Link>
            </div>
          ) : !investigation?.id ? (
            <p className="accusation-page-message">Investigation details are unavailable, so an accusation cannot be submitted.</p>
          ) : !hasSuspects ? (
            <p className="accusation-page-message">Suspect data is unavailable. Load the case information before submitting an accusation.</p>
          ) : (
            <div className="accusation-page-layout">
              <aside className="accusation-page-material">
                <p className="eyebrow">Review</p>
                <h2>Case material</h2>
                {clues.length > 0 && (
                  <section>
                    <h3>Clues</h3>
                    <ul>{clues.map((clue) => <li key={clue.id}><strong>{clue.name}</strong>{clue.description && <span>{clue.description}</span>}</li>)}</ul>
                  </section>
                )}
                {evidenceItems.length > 0 && (
                  <section>
                    <h3>Evidence</h3>
                    <ul>{evidenceItems.map((item) => <li key={item.id}><strong>{item.name}</strong>{item.description && <span>{item.description}</span>}</li>)}</ul>
                  </section>
                )}
                {clues.length === 0 && evidenceItems.length === 0 && (
                  <p className="accusation-page-muted">No clue or evidence summaries are available from the case API.</p>
                )}
              </aside>

              <section className="accusation-page-form-section">
                <p className="eyebrow">Your conclusion</p>
                <h2>Submit your accusation</h2>
                <form className="accusation-page-form" onSubmit={handleSubmit}>
                  <label>
                    Suspect
                    <select name="culprit" value={formData.culprit} onChange={handleChange} required>
                      <option value="">Select a suspect</option>
                      {suspects.map((suspect) => (
                        <option key={suspect.id} value={suspect.name}>{suspect.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Motive
                    <input name="motive" value={formData.motive} onChange={handleChange} maxLength="120" required />
                  </label>
                  <label>
                    Method
                    <input name="method" value={formData.method} onChange={handleChange} maxLength="120" required />
                  </label>
                  <label>
                    Supporting evidence
                    <textarea name="evidence" value={formData.evidence} onChange={handleChange} rows="3" maxLength="120" required />
                  </label>
                  <label>
                    Explanation
                    <textarea name="explanation" value={formData.explanation} onChange={handleChange} rows="5" required />
                  </label>

                  <label className="accusation-page-confirmation">
                    <input
                      name="confirmed"
                      type="checkbox"
                      checked={formData.confirmed}
                      onChange={handleChange}
                      required
                    />
                    <span>I have reviewed my conclusion and confirm this is my final accusation.</span>
                  </label>

                  {submitError && <p className="accusation-page-submit-error" role="alert">{submitError}</p>}

                  <button className="primary-button" type="submit" disabled={submitting || !formData.confirmed}>
                    {submitting ? 'Submitting...' : 'Submit final accusation'}
                  </button>
                </form>
              </section>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default AccusationPage