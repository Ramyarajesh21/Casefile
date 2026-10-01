import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand">
            <span className="brand-mark">C</span>
            <span>CASEFILE</span>
          </div>
          <p className="muted">Every case has a secret.</p>
        </div>

        <div>
          <h4>Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">About</Link></li>
            <li><Link to="/cases">Cases</Link></li>
            <li><Link to="/profile">Privacy</Link></li>
            <li><Link to="/settings">Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 CASEFILE</span>
      </div>
    </footer>
  )
}

export default Footer
