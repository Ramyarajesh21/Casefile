import { Link } from 'react-router-dom'

function CaseCard({ caseItem }) {
  return (
    <article className="case-card">
      <div className="case-header-row">
        <span className="eyebrow">{caseItem.case_number}</span>
        <span className={`badge difficulty-${caseItem.difficulty.toLowerCase()}`}>{caseItem.difficulty}</span>
      </div>
      <h3>{caseItem.title}</h3>
      <p>{caseItem.description}</p>
      <ul className="case-meta">
        <li>{caseItem.location}</li>
        <li>{caseItem.clue_count} clues</li>
        <li>{caseItem.suspect_count} suspects</li>
      </ul>
      <Link to={`/cases/${caseItem.id}`} className="primary-button small-button">View Case</Link>
    </article>
  )
}

export default CaseCard
