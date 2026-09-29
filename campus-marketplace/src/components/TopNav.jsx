import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUI } from '../context/UIContext.jsx'

export default function TopNav() {
  const { toggleSidebar, navVisible } = useUI()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const submitSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/discover?q=${encodeURIComponent(query.trim())}`)
    setSearchOpen(false)
    setQuery('')
  }

  return (
    <header className={`top-nav ${navVisible ? 'is-visible' : 'is-hidden'}`}>
      <button
        className="icon-btn"
        aria-label="Open menu"
        onClick={toggleSidebar}
      >
        <BarsIcon />
      </button>

      <Link to="/" className="display top-nav__brand">
        Bazaar
      </Link>

      <div className="top-nav__right">
        <Link to="/" className="icon-btn" aria-label="Home">
          <HomeIcon />
        </Link>
        <button
          className="icon-btn"
          aria-label="Search"
          onClick={() => setSearchOpen((v) => !v)}
        >
          <SearchIcon />
        </button>
      </div>

      {searchOpen && (
        <form className="top-nav__search" onSubmit={submitSearch}>
          <input
            autoFocus
            type="search"
            placeholder="Search listings…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      )}

      <style>{`
        .top-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 40;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 16px;
          background: var(--bg);
          border-bottom: 1px solid var(--border);
          transition: transform 0.35s ease, opacity 0.35s ease;
        }
        .top-nav.is-hidden {
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
        }
        .top-nav.is-visible {
          transform: translateY(0);
          opacity: 1;
        }
        .top-nav__brand {
          flex: 1;
          text-align: center;
          font-size: 1.7rem;
          letter-spacing: -0.01em;
        }
        .top-nav__right {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--text);
          transition: background 0.18s ease, transform 0.15s var(--ease-settle);
        }
        .icon-btn:hover {
          background: var(--border);
        }
        .icon-btn:active {
          transform: scale(0.92);
        }
        .top-nav__search {
          position: absolute;
          top: 64px;
          right: 16px;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px;
          box-shadow: 0 8px 24px -6px rgba(var(--shadow-color), 0.3);
        }
        .top-nav__search input {
          border: none;
          background: transparent;
          color: var(--text);
          font-size: 0.95rem;
          width: 220px;
          padding: 6px 8px;
        }
        .top-nav__search input:focus {
          outline: none;
        }
        @media (max-width: 640px) {
          .top-nav__brand { font-size: 1.3rem; }
          .top-nav__search input { width: 160px; }
        }
      `}</style>
    </header>
  )
}

function BarsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}
function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  )
}
