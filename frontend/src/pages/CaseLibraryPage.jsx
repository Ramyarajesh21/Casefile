import { useEffect, useState } from 'react'
import CaseCard from '../components/CaseCard'
import { fetchCases } from '../services/caseService'
import './CaseLibraryPage.css'

function CaseLibraryPage() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let isCurrent = true

    const loadCases = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await fetchCases()
        if (isCurrent) {
          setCases(Array.isArray(response?.cases) ? response.cases : [])
        }
      } catch {
        if (isCurrent) {
          setError('The case library is unavailable right now. Please try again.')
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadCases()
    return () => {
      isCurrent = false
    }
  }, [retryCount])

  return (
    <section className="case-library">
      <div className="case-library-heading">
        <div>
          <p className="eyebrow">Investigations</p>
          <h1>Case Library</h1>
          <p className="case-library-description">Choose a case to review its briefing and evidence.</p>
        </div>
        {!loading && !error && (
          <p className="case-library-count" aria-live="polite">
            {cases.length} {cases.length === 1 ? 'case' : 'cases'}
          </p>
        )}
      </div>

      {loading && <p className="case-library-message" role="status">Loading cases...</p>}

      {!loading && error && (
        <div className="case-library-message case-library-error" role="alert">
          <p>{error}</p>
          <button className="secondary-button" type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && cases.length === 0 && (
        <p className="case-library-message">No cases are available yet.</p>
      )}

      {!loading && !error && cases.length > 0 && (
        <div className="case-library-grid">
          {cases.map((caseItem) => <CaseCard key={caseItem.id} caseItem={caseItem} />)}
        </div>
      )}
    </section>
  )
}

export default CaseLibraryPage