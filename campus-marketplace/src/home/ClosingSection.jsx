import { useEffect, useLayoutEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { LABEL_TOTAL } from './stepConfig.js'

// Edit this one line once you have the real handle — used here and in MobileStack.
export const CREATOR_INSTAGRAM_URL = 'https://instagram.com/yourhandle'

// Geometry, in one place. The diagonal runs from (SEAM_TOP, 0) to (SEAM_BOTTOM, 100%).
// Each half is clipped to one side of that line, and content is padded so it
// sits fully inside its own side — the earlier version centred content across
// the whole width, so the diagonal sliced straight through the text.
export default function ClosingSection({ active }) {
  const rootRef = useRef(null)
  const leftRef = useRef(null)
  const rightRef = useRef(null)
  const seamRef = useRef(null)
  const leftCardRef = useRef(null)
  const rightCardRef = useRef(null)
  const tlRef = useRef(null)
  const prevActive = useRef(false)

  // parked pose: hidden, halves waiting off-screen on their own sides
  useLayoutEffect(() => {
    gsap.set(rootRef.current, { autoAlpha: 0 })
    gsap.set(leftRef.current, { xPercent: -100 })
    gsap.set(rightRef.current, { xPercent: 100 })
    gsap.set([leftCardRef.current, rightCardRef.current], { y: 36, opacity: 0 })
    gsap.set(seamRef.current, { opacity: 0 })
    return () => tlRef.current?.kill()
  }, [])

  useEffect(() => {
    if (prevActive.current === active) return
    prevActive.current = active

    tlRef.current?.kill()
    const tl = gsap.timeline()
    tlRef.current = tl
    const cards = [leftCardRef.current, rightCardRef.current]

    if (active) {
      tl.set(rootRef.current, { autoAlpha: 1 }, 0)
      tl.to(leftRef.current, { xPercent: 0, duration: 1.25, ease: 'expo.out' }, 0)
      tl.to(rightRef.current, { xPercent: 0, duration: 1.25, ease: 'expo.out' }, 0.1)
      tl.to(seamRef.current, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.7)
      tl.to(cards, { y: 0, opacity: 1, duration: 0.95, stagger: 0.14, ease: 'power3.out' }, 0.5)
    } else {
      tl.to(cards, { y: 24, opacity: 0, duration: 0.35, ease: 'power2.in' }, 0)
      tl.to(seamRef.current, { opacity: 0, duration: 0.3 }, 0)
      tl.to(leftRef.current, { xPercent: -100, duration: 0.9, ease: 'power3.in' }, 0.1)
      tl.to(rightRef.current, { xPercent: 100, duration: 0.9, ease: 'power3.in' }, 0.1)
      tl.set(rootRef.current, { autoAlpha: 0 })
    }
  }, [active])

  return (
    <div ref={rootRef} className="closing" style={{ pointerEvents: active ? 'auto' : 'none' }} aria-hidden={!active}>
      <a
        ref={leftRef}
        className="closing__half closing__half--left"
        href={CREATOR_INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        tabIndex={active ? 0 : -1}
      >
        <div ref={leftCardRef} className="closing__card">
          <span className="display closing__letter">T</span>
          <div className="closing__copy">
            <span className="mono closing__label">
              {LABEL_TOTAL} / {LABEL_TOTAL}
            </span>
            <h2 className="display closing__title">About the creator</h2>
            <span className="mono closing__cta">Instagram →</span>
          </div>
        </div>
      </a>

      <Link ref={rightRef} className="closing__half closing__half--right" to="/discover" tabIndex={active ? 0 : -1}>
        <div ref={rightCardRef} className="closing__card">
          <span className="mono closing__label">Every category, one place</span>
          <div className="closing__copy">
            <h2 className="display closing__title">Discover products</h2>
            <span className="mono closing__cta">Browse all listings →</span>
          </div>
        </div>
      </Link>

      <span ref={seamRef} className="closing__seam" aria-hidden="true" />

      <style>{`
        .closing {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }
        .closing__half {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          transition: background 0.45s ease, color 0.45s ease;
        }
        /* left: dark palette, hover → light. right: light palette, hover → dark.
           Colours come from the fixed --ink-* / --paper-* tokens, so both are
           visible at once whichever site theme is active. */
        .closing__half--left {
          clip-path: polygon(0 0, 58% 0, 42% 100%, 0 100%);
          background: var(--ink-bg);
          color: var(--ink-text);
          --line: rgba(245, 247, 250, 0.34);
          padding-left: 6vw;
        }
        .closing__half--left:hover {
          background: var(--paper-bg);
          color: var(--paper-text);
          --line: rgba(26, 42, 74, 0.34);
        }
        .closing__half--right {
          clip-path: polygon(58% 0, 100% 0, 100% 100%, 42% 100%);
          background: var(--paper-bg);
          color: var(--paper-text);
          --line: rgba(26, 42, 74, 0.34);
          padding-left: 63vw;
        }
        .closing__half--right:hover {
          background: var(--ink-bg);
          color: var(--ink-text);
          --line: rgba(245, 247, 250, 0.34);
        }
        .closing__card {
          width: min(32vw, 480px);
          min-height: 330px;
          padding: 28px 30px;
          border: 1px solid var(--line);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 28px;
          transition: border-color 0.45s ease;
        }
        .closing__letter {
          font-size: clamp(5.5rem, 10vw, 8.5rem);
        }
        .closing__copy {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .closing__label,
        .closing__cta {
          opacity: 0.75;
        }
        .closing__title {
          font-size: clamp(2.2rem, 3.8vw, 3.6rem);
        }
        /* the "/" itself: a thin sliver clipped along exactly the same edge as the halves */
        .closing__seam {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, var(--ink-accent), var(--paper-accent));
          clip-path: polygon(58% 0, calc(58% + 3px) 0, calc(42% + 3px) 100%, 42% 100%);
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
