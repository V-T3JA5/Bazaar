import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CATEGORIES, LABEL_TOTAL } from './stepConfig.js'
import { CREATOR_INSTAGRAM_URL } from './ClosingSection.jsx'

gsap.registerPlugin(ScrollTrigger)

export default function MobileStack({ reduceMotion }) {
  const rootRef = useRef(null)

  useEffect(() => {
    if (reduceMotion) return undefined
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.mobile-stack__reveal').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: 'power1.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        })
      })
    }, rootRef)
    return () => ctx.revert()
  }, [reduceMotion])

  return (
    <div ref={rootRef} className="mobile-stack">
      <div className="mobile-stack__hero">
        <h1 className="display">Bazaar</h1>
        <p className="mono">by T</p>
      </div>

      {CATEGORIES.map((cat, i) => (
        <Link key={cat.name} to={`/category/${cat.name}`} className="mobile-stack__block mobile-stack__reveal">
          <span className="mono mobile-stack__index">{String(i + 1).padStart(2, '0')} / {LABEL_TOTAL}</span>
          <h2 className="display">{cat.name}</h2>
          <p>{cat.description}</p>
          <span className="mono mobile-stack__cta">Browse {cat.name} →</span>
        </Link>
      ))}

      <a
        href={CREATOR_INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        className="mobile-stack__closing mobile-stack__closing--ink mobile-stack__reveal"
      >
        <span className="display mobile-stack__letter">T</span>
        <h2 className="display">About the creator</h2>
        <span className="mono">Instagram →</span>
      </a>

      <Link to="/discover" className="mobile-stack__closing mobile-stack__closing--paper mobile-stack__reveal">
        <h2 className="display">Discover products</h2>
        <span className="mono">Browse all listings →</span>
      </Link>

      <style>{`
        .mobile-stack {
          padding: 120px 24px 0;
        }
        .mobile-stack__hero {
          text-align: center;
          padding: 40px 0 90px;
        }
        .mobile-stack__hero h1 {
          font-size: clamp(3rem, 20vw, 5rem);
        }
        .mobile-stack__hero p {
          margin-top: 10px;
          color: var(--text-secondary);
        }
        .mobile-stack__block {
          display: block;
          padding: 56px 0;
          border-top: 1px solid var(--border);
        }
        .mobile-stack__index {
          display: block;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }
        .mobile-stack__block h2 {
          font-size: clamp(2.4rem, 13vw, 3.4rem);
        }
        .mobile-stack__block p {
          margin-top: 14px;
          max-width: 48ch;
        }
        .mobile-stack__cta {
          display: inline-block;
          margin-top: 16px;
          color: var(--accent);
        }
        .mobile-stack__closing {
          display: block;
          margin: 0 -24px;
          padding: 64px 24px;
        }
        .mobile-stack__closing--ink {
          background: var(--ink-bg);
          color: var(--ink-text);
        }
        .mobile-stack__closing--paper {
          background: var(--paper-bg);
          color: var(--paper-text);
        }
        .mobile-stack__letter {
          display: block;
          font-size: 5rem;
          margin-bottom: 12px;
        }
        .mobile-stack__closing h2 {
          font-size: clamp(2rem, 9vw, 2.8rem);
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  )
}
