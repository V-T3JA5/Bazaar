import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'

// Edit this one line once you have the real handle — used here and in MobileStack.
export const CREATOR_INSTAGRAM_URL = 'https://instagram.com/yourhandle'

export default function ClosingSection({ active }) {
  const rootRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const hasMounted = useRef(false)

  useEffect(() => {
    const instant = !hasMounted.current
    hasMounted.current = true

    const ctx = gsap.context(() => {
      gsap.to(rootRef.current, {
        opacity: active ? 1 : 0,
        duration: instant ? 0 : 0.4,
        ease: 'power1.out',
      })
      gsap.to(leftRef.current, {
        xPercent: active ? 0 : -100,
        duration: instant ? 0 : 0.95,
        ease: active ? 'power4.out' : 'power2.in',
      })
      gsap.to(rightRef.current, {
        xPercent: active ? 0 : 100,
        duration: instant ? 0 : 0.95,
        ease: active ? 'power4.out' : 'power2.in',
      })
    }, rootRef)

    return () => ctx.revert()
  }, [active])

  return (
    <div
      ref={rootRef}
      className="closing"
      style={{ pointerEvents: active ? 'auto' : 'none' }}
      aria-hidden={!active}
    >
      <a
        ref={leftRef}
        className="closing__half closing__half--left"
        href={CREATOR_INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        tabIndex={active ? 0 : -1}
      >
        <span className="display closing__letter">T</span>
        <div className="closing__copy">
          <span className="mono closing__index">04 / 04</span>
          <h2 className="display closing__title">About the creator</h2>
          <span className="mono closing__cta">Instagram →</span>
        </div>
      </a>

      <Link ref={rightRef} className="closing__half closing__half--right" to="/discover" tabIndex={active ? 0 : -1}>
        <div className="closing__copy closing__copy--right">
          <span className="mono closing__index">Everything</span>
          <h2 className="display closing__title">Discover products</h2>
          <span className="mono closing__cta">Browse all listings →</span>
        </div>
      </Link>

      <span className="closing__seam" aria-hidden="true" />

      <style>{`
        .closing {
          position: absolute;
          inset: 0;
          opacity: 0;
          overflow: hidden;
        }
        .closing__half {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          transition: background 0.4s ease, color 0.4s ease;
        }
        .closing__half--left {
          clip-path: polygon(0 0, 58% 0, 42% 100%, 0 100%);
          background: var(--ink-bg);
          color: var(--ink-text);
          justify-content: space-between;
          padding: 8vh 5vw;
          flex-direction: column;
        }
        .closing__half--left:hover {
          background: var(--paper-bg);
          color: var(--paper-text);
        }
        .closing__half--right {
          clip-path: polygon(58% 0, 100% 0, 100% 100%, 42% 100%);
          background: var(--paper-bg);
          color: var(--paper-text);
          justify-content: center;
          padding: 8vh 6vw 8vh 12vw;
        }
        .closing__half--right:hover {
          background: var(--ink-bg);
          color: var(--ink-text);
        }
        .closing__letter {
          font-size: clamp(6rem, 12vw, 10rem);
        }
        .closing__copy {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .closing__copy--right {
          max-width: 32ch;
        }
        .closing__index,
        .closing__cta {
          opacity: 0.75;
        }
        .closing__title {
          font-size: clamp(2.2rem, 5vw, 3.6rem);
          margin: 4px 0;
        }
        .closing__seam {
          position: absolute;
          top: -5%;
          left: 58%;
          width: 2px;
          height: 110%;
          background: var(--text-secondary);
          opacity: 0.25;
          transform: rotate(9deg);
          transform-origin: top;
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .closing__half--left,
          .closing__half--right {
            clip-path: none;
            position: relative;
            inset: auto;
            width: 100%;
            padding: 60px 24px;
          }
          .closing { position: static; }
          .closing__seam { display: none; }
        }
      `}</style>
    </div>
  )
}
