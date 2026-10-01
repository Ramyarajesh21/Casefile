import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'

const featureCases = [
  { title: 'The Missing Necklace', difficulty: 'Easy', description: "Meena's gold necklace went missing during a small family function.", location: "Meena's House, Trichy" },
  { title: 'Silence at Ooty Lake', difficulty: 'Easy', description: 'A private rehearsal turns into a trail of rain-soaked clues.' },
  { title: 'The Last Train', difficulty: 'Hard', description: 'Blackout conditions and a sealed carriage complicate the case.' },
]

function HomePage() {
  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow golden">Casefile</p>
            <h1>Every Case Has A Secret.</h1>
            <p className="lead">Observe. Investigate. Connect The Evidence. Solve The Case.</p>
            <div className="hero-actions">
              <Link to="/login" className="primary-button">Start Investigation</Link>
              <Link to="/cases" className="secondary-button">Explore Cases</Link>
            </div>
          </div>
          <div className="hero-panel">
            <div className="panel-card glass-panel">
              <p>Current Case</p>
              <h3>The Missing Necklace</h3>
              <ul>
                <li>Difficulty: Easy</li>
                <li>Location: Meena's House, Trichy</li>
                <li>Clues: 4</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2>From clue to accusation</h2>
          </div>
          <div className="three-column">
            <article className="info-card">
              <span>01</span>
              <h3>Read the briefing</h3>
              <p>Study the victim, timeline, and known facts before you move.</p>
            </article>
            <article className="info-card">
              <span>02</span>
              <h3>Trace the evidence</h3>
              <p>Find clues, collect evidence, and evaluate witness statements.</p>
            </article>
            <article className="info-card">
              <span>03</span>
              <h3>Deliver the verdict</h3>
              <p>Connect the dots, deduce motives, and submit your final accusation.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section-block alt-block">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Featured cases</p>
            <h2>Open investigations</h2>
          </div>
          <div className="case-grid">
            {featureCases.map((item) => (
              <article key={item.title} className="feature-card">
                <span className={`badge difficulty-${item.difficulty.toLowerCase()}`}>{item.difficulty}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                {item.location && <p>{item.location}</p>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Detective stats</p>
            <h2>Casefile network</h2>
          </div>
          <div className="stats-grid">
            <StatCard label="Open Cases" value="5" />
            <StatCard label="Solved" value="1,286" tone="success" />
            <StatCard label="Active Detectives" value="8.4K" tone="warning" />
            <StatCard label="Average Accuracy" value="78%" tone="default" />
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
