import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { fetchCaseById, fetchCaseClues, fetchCaseEvidence } from '../services/caseService'
import { fetchDeductions, saveDeduction, startInvestigation } from '../services/investigationService'
import './DeductionPage.css'

function DeductionPage() {
  const { caseId } = useParams()
  const { user } = useAuth()
  const [caseInfo, setCaseInfo] = useState(null)
  const [investigation, setInvestigation] = useState(null)
  const [items, setItems] = useState([])
  const [deductions, setDeductions] = useState([])
  const [formData, setFormData] = useState({ item_a: '', item_b: '', reasoning: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dataError, setDataError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [savedMessage, setSavedMessage] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadDeductionWorkspace = async () => {
      setLoading(true)
      setError('')
      setDataError('')
      setSaveError('')
      setSavedMessage('')
      setNotFound(false)
      setCaseInfo(null)
      setInvestigation(null)
      setItems([])
      setDeductions([])

      try {
        const caseResponse = await fetchCaseById(caseId)
        const loadedCase = caseResponse?.case
        if (!loadedCase) {
          if (isCurrent) setNotFound(true)
          return
        }
        if (isCurrent) setCaseInfo(loadedCase)

        const [cluesResult, evidenceResult, investigationResult] = await Promise.allSettled([
          fetchCaseClues(caseId),
          fetchCaseEvidence(caseId),
          startInvestigation({ user_id: user.id, case_id: loadedCase.id }),
        ])

        if (!isCurrent) return

        const resources = []
        if (cluesResult.status === 'fulfilled') {
          const clues = Array.isArray(cluesResult.value?.clues) ? cluesResult.value.clues : []
          resources.push(...clues.map((clue) => ({
            value: `Clue: ${clue.name}`,
            label: `Clue: ${clue.name}`,
          })))
        }
        if (evidenceResult.status === 'fulfilled') {
          const evidence = Array.isArray(evidenceResult.value?.evidence) ? evidenceResult.value.evidence : []
          resources.push(...evidence.map((item) => ({
            value: `Evidence: ${item.name}`,
            label: `Evidence: ${item.name}`,
          })))
        }
        setItems(resources)

        const resourceFailures = []
        if (cluesResult.status === 'rejected') resourceFailures.push('clues')
        if (evidenceResult.status === 'rejected') resourceFailures.push('evidence')
        if (resourceFailures.length) {
          setDataError(`${resourceFailures.join(' and ')} could not be loaded. Some deduction options may be missing.`)
        }

        if (investigationResult.status !== 'fulfilled' || !investigationResult.value?.investigation) {
          setDataError((current) => [current, 'Investigation details are unavailable.'].filter(Boolean).join(' '))
          return
        }

        const loadedInvestigation = investigationResult.value.investigation
        setInvestigation(loadedInvestigation)
        try {
          const deductionResponse = await fetchDeductions(loadedInvestigation.id)
          if (isCurrent) {
            setDeductions(Array.isArray(deductionResponse?.deductions) ? deductionResponse.deductions : [])
          }
        } catch {
          if (isCurrent) setDataError((current) => [current, 'Saved deductions could not be loaded.'].filter(Boolean).join(' '))
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

    loadDeductionWorkspace()
    return () => {
      isCurrent = false
    }
  }, [caseId, retryCount, user.id])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setSaveError('')
    setSavedMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!investigation?.id || !formData.item_a || !formData.item_b || !formData.reasoning.trim()) return
    if (formData.item_a === formData.item_b) {
      setSaveError('Choose two different items to connect.')
      return
    }

    setSaving(true)
    setSaveError('')
    setSavedMessage('')
    try {
      const response = await saveDeduction(investigation.id, {
        item_a: formData.item_a,
        item_b: formData.item_b,
        reasoning: formData.reasoning.trim(),
      })
      if (response?.deduction) {
        setDeductions((current) => [...current, response.deduction])
        setFormData((current) => ({ ...current, reasoning: '' }))
        setSavedMessage('Deduction saved.')
      } else {
        setSaveError('The API did not confirm that the deduction was saved. Please retry.')
      }
    } catch {
      setSaveError('Deduction could not be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="deduction-page">
      <div className="deduction-page-navigation">
        <Link to={`/investigation/${caseId}`}>&larr; Investigation workspace</Link>
        <Link to={`/investigation/${caseId}/evidence`}>Evidence</Link>
      </div>

      {loading && <p className="deduction-page-message" role="status">Loading deduction workspace...</p>}

      {!loading && error && (
        <div className="deduction-page-message deduction-page-feedback" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && notFound && (
        <div className="deduction-page-message" role="status">
          <h1>Case not found</h1>
          <p>There is no available case file for this deduction workspace.</p>
        </div>
      )}

      {!loading && !error && caseInfo && (
        <>
          <header className="deduction-page-header">
            <p className="eyebrow">{caseInfo.case_number || 'Investigation'}</p>
            <h1>{caseInfo.title}</h1>
            <p>{caseInfo.briefing || caseInfo.description || 'No case briefing is available.'}</p>
            <div className="deduction-page-progress" aria-live="polite">
              <span>Investigation: <strong>{investigation?.status || 'Unavailable'}</strong></span>
              {investigation?.current_stage && (
                <span>Current stage: <strong>{investigation.current_stage.replaceAll('_', ' ')}</strong></span>
              )}
              {investigation?.score != null && <span>Score: <strong>{investigation.score}</strong></span>}
            </div>
          </header>

          {dataError && (
            <div className="deduction-page-data-error" role="status">
              <p>{dataError}</p>
              <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
                Reload workspace
              </button>
            </div>
          )}

          <div className="deduction-page-layout">
            <section className="deduction-page-resources" aria-labelledby="deduction-resources-title">
              <p className="eyebrow">Case material</p>
              <h2 id="deduction-resources-title">Available clues and evidence</h2>
              {items.length === 0 ? (
                <p className="deduction-page-empty">No clue or evidence items are available to connect.</p>
              ) : (
                <ul>
                  {items.map((item) => <li key={item.value}>{item.label}</li>)}
                </ul>
              )}
            </section>

            <section className="deduction-page-form-section" aria-labelledby="deduction-form-title">
              <p className="eyebrow">Build a connection</p>
              <h2 id="deduction-form-title">Record a deduction</h2>
              {items.length < 2 ? (
                <p className="deduction-page-empty">At least two available case items are needed to record a connection.</p>
              ) : !investigation?.id ? (
                <p className="deduction-page-empty">Investigation data is unavailable, so deductions cannot be saved right now.</p>
              ) : (
                <form className="deduction-page-form" onSubmit={handleSubmit}>
                  <label>
                    First item
                    <select name="item_a" value={formData.item_a} onChange={handleChange} required>
                      <option value="">Select a clue or evidence item</option>
                      {items.map((item) => <option key={`first-${item.value}`} value={item.value}>{item.label}</option>)}
                    </select>
                  </label>
                  <label>
                    Second item
                    <select name="item_b" value={formData.item_b} onChange={handleChange} required>
                      <option value="">Select a clue or evidence item</option>
                      {items.map((item) => <option key={`second-${item.value}`} value={item.value}>{item.label}</option>)}
                    </select>
                  </label>
                  <label>
                    Reasoning
                    <textarea
                      name="reasoning"
                      value={formData.reasoning}
                      onChange={handleChange}
                      rows="5"
                      maxLength="2000"
                      placeholder="Explain how these details may connect"
                      required
                    />
                  </label>
                  {saveError && <p className="deduction-page-save-error" role="alert">{saveError}</p>}
                  {savedMessage && <p className="deduction-page-saved" role="status">{savedMessage}</p>}
                  <button className="primary-button" type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save deduction'}
                  </button>
                </form>
              )}
            </section>
          </div>

          <section className="deduction-page-saved-list" aria-labelledby="saved-deductions-title">
            <div className="deduction-page-list-heading">
              <div>
                <p className="eyebrow">Investigation notes</p>
                <h2 id="saved-deductions-title">Saved deductions</h2>
              </div>
              <span>{deductions.length} {deductions.length === 1 ? 'deduction' : 'deductions'}</span>
            </div>
            {deductions.length === 0 ? (
              <p className="deduction-page-empty">No saved deductions are available yet.</p>
            ) : (
              <ol className="deduction-page-list">
                {deductions.map((deduction, index) => (
                  <li className="deduction-page-record" key={deduction.id ?? `${deduction.item_a}-${index}`}>
                    <div className="deduction-page-connection">
                      <strong>{deduction.item_a}</strong>
                      <span aria-hidden="true">&harr;</span>
                      <strong>{deduction.item_b}</strong>
                    </div>
                    <p>{deduction.reasoning}</p>
                    {deduction.created_at && <time dateTime={deduction.created_at}>{new Date(deduction.created_at).toLocaleString()}</time>}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </>
      )}
    </section>
  )
}

export default DeductionPage