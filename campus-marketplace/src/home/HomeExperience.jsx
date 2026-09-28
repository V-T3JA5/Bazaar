import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useUI } from '../context/UIContext.jsx'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { CATEGORIES, TOTAL_STEPS, categoryIndexForStep, categoryState, isClosingStep } from './stepConfig.js'
import HeroLayer from './HeroLayer.jsx'
import CategoryLayer from './CategoryLayer.jsx'
import ClosingSection from './ClosingSection.jsx'
import MobileStack from './MobileStack.jsx'

// A single physical scroll gesture — a hard fast flick or a light nudge —
// should always move exactly one step. The hard part is trackpads: one
// flick can fire wheel events continuously for over a second as its
// momentum decays, long after the "gesture" felt like it ended. A fixed
// lock timeout starting from the first event can expire mid-momentum,
// letting the tail end of one flick get read as a second gesture.
//
// So instead: every wheel event that arrives while locked pushes the
// unlock further out (QUIET_MS from *that* event), and unlocking also
// never happens before MIN_ANIM_MS has passed since the step actually
// changed. The lock only releases once the input has been genuinely
// quiet AND the transition has had time to finish.
const MIN_ANIM_MS = 1150
const QUIET_MS = 260
const WHEEL_THRESHOLD = 4
const SWIPE_THRESHOLD = 42

export default function HomeExperience() {
  const isDesktop = useMediaQuery('(min-width: 769px)')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  if (!isDesktop || reduceMotion) {
    return <MobileStack reduceMotion={reduceMotion} />
  }
  return <SteppedExperience />
}

function SteppedExperience() {
  const { setNavVisible } = useUI()
  const [step, setStep] = useState(0)
  const stepRef = useRef(0)
  const lockedRef = useRef(false)
  const lockOpenedAt = useRef(0)
  const unlockTimer = useRef(null)
  const stageRef = useRef(null)
  const touchStartY = useRef(null)

  useEffect(() => {
    stepRef.current = step
  }, [step])

  useEffect(() => {
    setNavVisible(step > 0)
  }, [step, setNavVisible])

  // lock the page's own scroll — this experience owns the wheel/touch instead
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
      clearTimeout(unlockTimer.current)
    }
  }, [])

  useEffect(() => {
    const bump = (dir) => {
      if (!stageRef.current) return
      gsap.fromTo(stageRef.current, { y: dir * 10 }, { y: 0, duration: 0.35, ease: 'power2.out' })
    }

    const armUnlock = () => {
      clearTimeout(unlockTimer.current)
      unlockTimer.current = window.setTimeout(function check() {
        const elapsed = Date.now() - lockOpenedAt.current
        if (elapsed < MIN_ANIM_MS) {
          unlockTimer.current = window.setTimeout(check, MIN_ANIM_MS - elapsed)
        } else {
          lockedRef.current = false
        }
      }, QUIET_MS)
    }

    const go = (dir) => {
      const next = Math.min(TOTAL_STEPS - 1, Math.max(0, stepRef.current + dir))
      if (next === stepRef.current) {
        bump(dir)
        return
      }
      lockedRef.current = true
      lockOpenedAt.current = Date.now()
      setStep(next)
      armUnlock()
    }

    const onWheel = (e) => {
      e.preventDefault()
      if (Math.abs(e.deltaY) < WHEEL_THRESHOLD) return
      if (lockedRef.current) {
        armUnlock() // still moving — keep pushing the unlock back
        return
      }
      go(e.deltaY > 0 ? 1 : -1)
    }

    const onKeyDown = (e) => {
      if (lockedRef.current) return
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
        go(1)
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        go(-1)
      }
    }

    const onTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY
    }
    const onTouchMove = (e) => {
      if (e.touches.length > 1) return // let pinch-zoom through
      e.preventDefault()
    }
    const onTouchEnd = (e) => {
      if (touchStartY.current === null || lockedRef.current) return
      const delta = touchStartY.current - e.changedTouches[0].clientY
      touchStartY.current = null
      if (Math.abs(delta) < SWIPE_THRESHOLD) return
      go(delta > 0 ? 1 : -1)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const jumpToCategory = (i) => {
    if (lockedRef.current) return
    lockedRef.current = true
    lockOpenedAt.current = Date.now()
    setStep(1 + i * 2)
    window.setTimeout(() => {
      lockedRef.current = false
    }, MIN_ANIM_MS)
  }

  const activeCategory = categoryIndexForStep(step)

  return (
    <div ref={stageRef} className="stage">
      <HeroLayer active={step === 0} reduceMotion={false} />

      {CATEGORIES.map((cat, i) => (
        <CategoryLayer key={cat.name} index={i} category={cat} state={categoryState(i, step)} renderCanvas />
      ))}

      <ClosingSection active={isClosingStep(step)} />

      <div className="stage__mark stage__mark--tl" aria-hidden="true" />
      <div className="stage__mark stage__mark--tr" aria-hidden="true" />
      <div className="stage__mark stage__mark--bl" aria-hidden="true" />
      <span className="mono stage__step-readout" aria-hidden="true">
        {String(step).padStart(2, '0')} / {String(TOTAL_STEPS - 1).padStart(2, '0')}
      </span>

      <nav className="stage__dots" aria-label="Jump to category">
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat.name}
            className={`stage__dot ${activeCategory === i ? 'is-active' : ''}`}
            onClick={() => jumpToCategory(i)}
            aria-label={`Go to ${cat.name}`}
          >
            <span className="mono">{String(i + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </nav>

      <style>{`
        .stage {
          position: fixed;
          inset: 0;
          overflow: hidden;
        }
        .stage__mark {
          position: fixed;
          width: 18px;
          height: 18px;
          border-color: var(--border);
          z-index: 30;
          pointer-events: none;
        }
        .stage__mark--tl {
          top: 18px;
          left: 18px;
          border-top: 1px solid var(--border);
          border-left: 1px solid var(--border);
        }
        .stage__mark--tr {
          top: 18px;
          right: 18px;
          border-top: 1px solid var(--border);
          border-right: 1px solid var(--border);
        }
        .stage__mark--bl {
          bottom: 18px;
          left: 18px;
          border-bottom: 1px solid var(--border);
          border-left: 1px solid var(--border);
        }
        .stage__step-readout {
          position: fixed;
          bottom: 22px;
          left: 44px;
          color: var(--text-secondary);
          z-index: 30;
        }
        .stage__dots {
          position: fixed;
          right: 28px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 14px;
          z-index: 30;
        }
        .stage__dot {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s var(--ease-settle);
        }
        .stage__dot:hover {
          transform: scale(1.1);
        }
        .stage__dot.is-active {
          border-color: var(--accent);
          color: var(--accent);
        }
      `}</style>
    </div>
  )
}
