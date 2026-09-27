import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CATEGORIES } from './stepConfig.js'

gsap.registerPlugin(ScrollTrigger)

export default function MobileStack({ reduceMotion }) {
  const rootRef = useRef(null)

  useEffect(() => {
    if (reduceMotion) return undefined
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.mobile-stack__block').forEach((el) => {
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
        <div key={cat.name} className="mobile-stack__block">
          <span className="mono mobile-stack__index">
            {String(i + 1).padStart(2, '0')} / 03
          </span>
          <h2 className="display">{cat.name}</h2>
          <p>{cat.description}</p>
        </div>
      ))}

      <style>{`
        .mobile-stack {
          padding: 120px 24px 80px;
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
      `}</style>
    </div>
  )
}
