import { Link } from 'react-router-dom'
import { useUI } from '../context/UIContext.jsx'
import { useListings } from '../context/ListingsContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, openCreateForm } = useUI()
  const { categories } = useListings()
  const { theme, toggleTheme } = useTheme()

  return (
    <>
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <button className="sidebar__add" onClick={openCreateForm}>
          + Add Product
        </button>

        <nav className="sidebar__nav">
          <span className="mono sidebar__label">Browse</span>
          {categories.map((cat) => (
            <Link key={cat} to={`/category/${cat}`} onClick={() => setSidebarOpen(false)}>
              {cat}
            </Link>
          ))}
          <Link to="/discover" onClick={() => setSidebarOpen(false)}>
            Discover
          </Link>
        </nav>

        <button className="sidebar__theme" onClick={toggleTheme}>
          {theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
        </button>

        <style>{`
          .sidebar-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.35);
            z-index: 45;
          }
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 260px;
            background: var(--bg-raised);
            border-right: 1px solid var(--border);
            z-index: 46;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
            gap: 24px;
            padding: 80px 20px 24px;
          }
          .sidebar.is-open {
            transform: translateX(0);
          }
          .sidebar__add {
            border: 1px solid var(--accent);
            background: var(--accent);
            color: var(--accent-text);
            font-weight: 600;
            padding: 12px 16px;
            border-radius: 10px;
          }
          .sidebar__nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .sidebar__label {
            color: var(--text-secondary);
            margin-bottom: 8px;
          }
          .sidebar__nav a {
            padding: 10px 8px;
            border-radius: 8px;
            font-weight: 500;
          }
          .sidebar__nav a:hover {
            background: var(--border);
          }
          .sidebar__theme {
            margin-top: auto;
            border: 1px solid var(--border);
            background: transparent;
            color: var(--text);
            padding: 10px 14px;
            border-radius: 8px;
            font-size: 0.9rem;
          }
        `}</style>
      </aside>
    </>
  )
}
