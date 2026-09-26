import { Link } from 'react-router-dom'

// Replace with the real handle before shipping.
const INSTAGRAM_URL = 'https://instagram.com/yourhandle'

export default function FinalSection() {
  return (
    <section className="final-section">
      <a
        className="final-card final-card--creator"
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
      >
        <span className="final-card__letter">T</span>
        <span className="mono final-card__label">About the creator — Instagram ↗</span>
      </a>

      <Link to="/discover" className="final-card final-card--cta">
        <h3>Discover products</h3>
        <p>Browse every listing across campus.</p>
      </Link>

      <style>{`
        .final-section {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 24px;
          padding: 60px 20px;
          flex-wrap: wrap;
        }
        .final-card {
          width: min(360px, 90vw);
          min-height: 260px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--bg-raised);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 28px;
          gap: 8px;
        }
        .final-card--creator {
          justify-content: space-between;
        }
        .final-card__letter {
          font-size: 6rem;
          font-weight: 700;
          line-height: 1;
        }
        .final-card__label {
          color: var(--text-secondary);
        }
        .final-card--cta {
          background: var(--accent);
          color: var(--accent-text);
        }
        .final-card--cta p {
          color: var(--accent-text);
          opacity: 0.85;
        }
      `}</style>
    </section>
  )
}
