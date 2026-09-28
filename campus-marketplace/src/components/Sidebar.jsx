import { NavLink } from 'react-router-dom'
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
            <NavLink key={cat} to={`/category/${cat}`} onClick={() => setSidebarOpen(false)}>
              {cat}
            </NavLink>
          ))}
          <NavLink to="/discover" onClick={() => setSidebarOpen(false)}>
            Discover
          </NavLink>
        </nav>

        <button
          className="sidebar__theme"
          onClick={toggleTheme}
          role="switch"
          aria-checked={theme === 'dark'}
          aria-label="Toggle dark mode"
        >
          <span className="sidebar__theme-track">
            <span className="sidebar__theme-knob">
              {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            </span>
          </span>
          <span className="mono">{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
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
            transition: transform 0.18s var(--ease-settle), box-shadow 0.18s var(--ease-settle);
          }
          .sidebar__add:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 20px -8px rgba(var(--shadow-color), 0.4);
          }
          .sidebar__add:active {
            transform: scale(0.97);
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
            transition: background 0.18s ease, transform 0.18s var(--ease-settle);
          }
          .sidebar__nav a:hover {
            background: var(--border);
            transform: translateX(3px);
          }
          .sidebar__nav a.active {
            color: var(--accent);
            font-weight: 600;
          }
          .sidebar__theme {
            margin-top: auto;
            display: flex;
            align-items: center;
            gap: 10px;
            border: 1px solid var(--border);
            background: transparent;
            color: var(--text);
            padding: 8px 14px;
            border-radius: 999px;
          }
          .sidebar__theme-track {
            width: 38px;
            height: 22px;
            border-radius: 999px;
            background: var(--border);
            position: relative;
            flex-shrink: 0;
          }
          .sidebar__theme-knob {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: var(--accent);
            color: var(--accent-text);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.25s var(--ease-settle);
          }
          [data-theme='dark'] .sidebar__theme-knob {
            transform: translateX(16px);
          }
        `}</style>
      </aside>
    </>
  )
}

function SunIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}
