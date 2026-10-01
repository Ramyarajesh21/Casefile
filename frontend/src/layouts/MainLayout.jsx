import Header from '../components/Header'
import Footer from '../components/Footer'

function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <Header />
      <main className="page-shell">{children}</main>
      <Footer />
    </div>
  )
}

export default MainLayout
