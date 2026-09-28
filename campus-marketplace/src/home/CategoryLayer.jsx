import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import PlaceholderModel from './PlaceholderModel.jsx'

gsap.registerPlugin(SplitText)

export default function CategoryLayer({ index, category, state, renderCanvas }) {
  const rootRef = useRef(null)
  const cardRef = useRef(null)
  const titleRef = useRef(null)
  const ruleRef = useRef(null)
  const descRef = useRef(null)
  const numeralRef = useRef(null)
  const canvasWrapRef = useRef(null)
  const modelGroupRef = useRef(null)

  const [modelReady, setModelReady] = useState(false)
  const setGroupRef = useCallback((node) => {
    modelGroupRef.current = node
    if (node) setModelReady(true)
  }, [])

  const hasMountedLifecycle = useRef(false) // idle <-> active (entry/exit + model + split)
  const hasMountedPhase = useRef(false) // entering <-> reading (title scale / desc / rule)
  const isActive = state !== 'idle'

  // The model always enters from — and retreats back out through — its own
  // side only, per spec.
  const side = category.reversed ? -1 : 1
  const entryX = side * 5.4

  // ---- LIFECYCLE: idle <-> active. Model flight, spin flourish, card
  // container, title char-reveal, background numeral. ----
  useEffect(() => {
    const instant = !hasMountedLifecycle.current
    hasMountedLifecycle.current = true
    let split = null

    const ctx = gsap.context(() => {
      gsap.to(cardRef.current, {
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 30,
        duration: instant ? 0 : isActive ? 0.9 : 0.55,
        ease: isActive ? 'power4.out' : 'power2.in',
      })
      gsap.to(numeralRef.current, {
        opacity: isActive ? 1 : 0,
        scale: isActive ? 1 : 0.85,
        duration: instant ? 0 : 1,
        ease: 'power2.out',
      })
      gsap.to(canvasWrapRef.current, {
        opacity: isActive ? 1 : 0,
        duration: instant ? 0 : 0.55,
        ease: 'power1.out',
      })

      if (isActive && !instant) {
        // the wordmark assembles itself, same signature move as the hero
        split = new SplitText(titleRef.current, { type: 'chars' })
        gsap.set(split.chars, { display: 'inline-block' })
        gsap.from(split.chars, {
          yPercent: 120,
          rotate: 6,
          opacity: 0,
          duration: 0.75,
          stagger: 0.03,
          ease: 'expo.out',
        })
      }

      if (modelReady) {
        if (instant) {
          gsap.set(modelGroupRef.current.position, { x: isActive ? 0 : entryX })
        } else if (isActive) {
          gsap.set(modelGroupRef.current.scale, { x: 0.55, y: 0.55, z: 0.55 })
          gsap.to(modelGroupRef.current.position, { x: 0, duration: 1.35, ease: 'back.out(1.3)' })
          gsap.to(modelGroupRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'back.out(1.6)' })

          const spin = gsap.timeline()
          spin
            .to(modelGroupRef.current.rotation, { y: '+=' + Math.PI * 2.2, duration: 1.3, ease: 'power3.out' }, 0)
            .to(modelGroupRef.current.rotation, { x: '+=' + Math.PI * 0.12, duration: 1.3, ease: 'power3.out' }, 0)
            // steady compound idle tumble — mostly Y, a whisper of X — takes
            // over seamlessly once the entrance flourish settles
            .to(modelGroupRef.current.rotation, { y: '+=' + Math.PI * 2, duration: 26, ease: 'none', repeat: -1 }, '>')
            .to(modelGroupRef.current.rotation, { x: '-=' + Math.PI * 0.24, duration: 13, ease: 'sine.inOut', repeat: -1, yoyo: true }, '<')
        } else {
          gsap.to(modelGroupRef.current.position, { x: entryX * 1.1, duration: 0.9, ease: 'power2.in' })
          gsap.to(modelGroupRef.current.scale, { x: 0.6, y: 0.6, z: 0.6, duration: 0.9, ease: 'power2.in' })
          gsap.to(modelGroupRef.current.rotation, { y: '+=' + Math.PI * 1.4, duration: 0.9, ease: 'power2.in' })
        }
      }
    }, rootRef)

    return () => {
      ctx.revert()
      if (split) split.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, modelReady])

  // ---- PHASE: entering <-> reading ----
  useEffect(() => {
    const instant = !hasMountedPhase.current || !hasMountedLifecycle.current
    hasMountedPhase.current = true
    const reading = state === 'reading'

    const ctx = gsap.context(() => {
      gsap.to(titleRef.current, {
        scale: reading ? 0.5 : 1,
        duration: instant ? 0 : 0.9,
        ease: 'power3.inOut',
      })
      gsap.set(descRef.current, { clipPath: 'inset(0 100% 0 0)' })
      gsap.to(descRef.current, {
        clipPath: reading ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
        duration: instant ? 0 : 0.7,
        ease: 'power2.inOut',
      })
      gsap.to(ruleRef.current, {
        scaleX: reading ? 1 : 0,
        duration: instant ? 0 : 0.65,
        ease: 'power2.inOut',
      })
    }, rootRef)

    return () => ctx.revert()
  }, [state])

  // hover: card ↔ model cross-interaction, plus tilt
  useEffect(() => {
    const el = canvasWrapRef.current
    if (!el) return undefined
    const onMove = (e) => {
      if (!isActive) return
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      gsap.to(el, { rotateY: px * 10, rotateX: py * -10, duration: 0.6, ease: 'power2.out', transformPerspective: 800 })
    }
    const onLeave = () => gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power2.out' })
    window.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [isActive])

  const handleCardEnter = () => {
    if (modelReady && isActive) {
      gsap.to(modelGroupRef.current.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.5, ease: 'power2.out' })
    }
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    gsap.to(titleRef.current, { color: accent, duration: 0.3 })
  }
  const handleCardLeave = () => {
    if (modelReady && isActive) {
      gsap.to(modelGroupRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.5, ease: 'power2.out' })
    }
    const text = getComputedStyle(document.documentElement).getPropertyValue('--text').trim()
    gsap.to(titleRef.current, {
      color: text,
      duration: 0.3,
      onComplete: () => gsap.set(titleRef.current, { clearProps: 'color' }),
    })
  }

  const label = String(index + 1).padStart(2, '0')

  return (
    <div
      ref={rootRef}
      className={`cat-layer ${category.reversed ? 'is-reversed' : ''}`}
      style={{ pointerEvents: isActive ? 'auto' : 'none' }}
      aria-hidden={!isActive}
    >
      <div className="cat-layer__inner">
        <div className="cat-layer__text-col">
          <span ref={numeralRef} className="display cat-layer__numeral" aria-hidden="true">
            {label}
          </span>
          <Link
            ref={cardRef}
            to={`/category/${category.name}`}
            className="cat-layer__card"
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}
            tabIndex={isActive ? 0 : -1}
          >
            <span className="mono cat-layer__index">{label} / 03</span>
            <h2 ref={titleRef} className="display cat-layer__title">
              {category.name}
            </h2>
            <span ref={ruleRef} className="cat-layer__rule" />
            <p ref={descRef} className="cat-layer__desc">
              {category.description}
            </p>
            <span className="mono cat-layer__cta">Browse {category.name} →</span>
          </Link>
        </div>

        {renderCanvas && (
          <div ref={canvasWrapRef} className="cat-layer__canvas">
            <Canvas camera={{ position: [0, 0, 4.6], fov: 42 }}>
              <ambientLight intensity={0.7} />
              <PlaceholderModel shape={category.shape} groupRef={setGroupRef} />
            </Canvas>
          </div>
        )}
      </div>

      <style>{`
        .cat-layer {
          position: absolute;
          inset: 0;
        }
        .cat-layer__inner {
          width: 100%;
          height: 100%;
          display: flex;
        }
        .cat-layer.is-reversed .cat-layer__inner {
          flex-direction: row-reverse;
        }
        .cat-layer__text-col {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          padding: 0 6vw;
          min-width: 0;
        }
        .cat-layer__numeral {
          position: absolute;
          ${category.reversed ? 'right: 3vw;' : 'left: 3vw;'}
          bottom: 4vh;
          font-size: clamp(6rem, 14vw, 11rem);
          color: transparent;
          -webkit-text-stroke: 1px var(--border);
          opacity: 0;
          line-height: 1;
          user-select: none;
          z-index: 0;
        }
        .cat-layer__card {
          position: relative;
          z-index: 1;
          display: block;
          opacity: 0;
          cursor: pointer;
        }
        .cat-layer__index {
          display: block;
          color: var(--text-secondary);
          margin-bottom: 14px;
        }
        .cat-layer__title {
          display: inline-block;
          font-size: clamp(3.4rem, 9.5vw, 8.5rem);
          transform-origin: ${category.reversed ? 'right center' : 'left center'};
          color: var(--text);
        }
        .cat-layer__rule {
          display: block;
          height: 2px;
          width: 100%;
          margin: 24px 0;
          background: var(--accent);
          box-shadow: 0 0 10px 0 var(--accent);
          transform: scaleX(0);
          transform-origin: ${category.reversed ? 'right' : 'left'};
        }
        .cat-layer__desc {
          max-width: 42ch;
          font-size: 1.15rem;
        }
        .cat-layer__cta {
          display: inline-block;
          margin-top: 20px;
          color: var(--accent);
        }
        .cat-layer__canvas {
          flex: 1;
          height: 100%;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
