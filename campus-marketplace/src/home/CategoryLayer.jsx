import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import LineArtModel from './LineArtModel.jsx'
import { CATEGORIES, LABEL_TOTAL } from './stepConfig.js'
import { useTheme } from '../context/ThemeContext.jsx'

gsap.registerPlugin(SplitText)

// start fetching the model files as soon as the app loads, not when the
// canvas first mounts
CATEGORIES.forEach((c) => c.model && useGLTF.preload(c.model))

// ─────────────────────────────────────────────────────────────────��[...]
// HOW THIS FILE ANIMATES — read before changing anything.
//
// A layer is always in one of three states: idle / entering / reading.
// Every state change builds a NEW timeline that animates from wherever
// things currently are to the new target, after killing the old timeline.
//
// We never call `ctx.revert()` between states. revert() snaps every
// animated property back to its pre-animation value, which is exactly what
// made the earlier versions have "no animation": each step change first
// reset the model to its resting spot and the card to opacity 0, *then*
// started a tween that had nothing left to travel. tween.kill() stops
// motion and leaves values where they are, which is what we want.
//
// Direction language, used everywhere: each thing enters from and exits
// back through its OWN side.
//   model side  = right for Academic/Other, left for Electronics
//   card  side  = the opposite half of the screen
// ─────────────────────────────────────────────────────────────────��[...]

const CARD_OPEN = 'inset(-6% -6% -6% -6%)'
const TEXT_OPEN = 'inset(0% 0% 0% 0%)'
const TEXT_CLOSED = 'inset(0% 100% 0% 0%)'

export default function CategoryLayer({ index, category, state }) {
  const { theme } = useTheme()
  const lineColor = theme === 'dark' ? '#f5f7fa' : '#1a2a4a'

  const isActive = state !== 'idle'
  const reading = state === 'reading'
  const modelSide = category.reversed ? -1 : 1
  const cardSide = -modelSide
  // the card wipes open from its own outer edge: closed = collapsed onto that edge
  const closedClip = cardSide < 0 ? 'inset(-6% 106% -6% -6%)' : 'inset(-6% -6% -6% 106%)'

  const cardRef = useRef(null)
  const titleRef = useRef(null)
  const ruleRef = useRef(null)
  const descRef = useRef(null)
  const canvasWrapRef = useRef(null)

  const outerRef = useRef(null)
  const spinRef = useRef(null)
  const boundsRef = useRef({ halfWidth: 1.6 })

  const splitRef = useRef(null)
  const baseFontRef = useRef(96)
  const cardTl = useRef(null)
  const modelTl = useRef(null)
  const idleSpin = useRef(null)
  const cardParked = useRef(true)
  const modelParked = useRef(true)
  const prevState = useRef('idle')
  const prevModelActive = useRef(null)
  const stateRef = useRef(state)
  stateRef.current = state

  const [modelReady, setModelReady] = useState(false)
  const [renderOn, setRenderOn] = useState(true) // false → canvas stops drawing while off-screen
  const setOuter = useCallback((n) => {
    outerRef.current = n
    if (n && spinRef.current) setModelReady(true)
  }, [])
  const setSpin = useCallback((n) => {
    spinRef.current = n
    if (n && outerRef.current) setModelReady(true)
  }, [])

  // ── one-time setup: resting (idle) visual state, title split, sizing ──
  useLayoutEffect(() => {
    const card = cardRef.current
    const title = titleRef.current

    const split = new SplitText(title, { type: 'chars' })
    splitRef.current = split
    gsap.set(split.chars, { display: 'inline-block' })

    // Fit the title to the card: the CSS clamp gives the ideal size, then we
    // shrink it if the longest word (ELECTRONICS) wouldn't fit inside the border.
    const measureBase = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      let size = Math.min(Math.max(3.4 * rem, 0.095 * window.innerWidth), 8.5 * rem)
      title.style.fontSize = `${size}px`
      const cs = getComputedStyle(card)
      const avail = card.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
      const w = title.getBoundingClientRect().width
      if (w > avail && w > 0) size *= (avail / w) * 0.97
      return size
    }
    const applyBase = () => {
      baseFontRef.current = measureBase()
      gsap.set(title, { fontSize: stateRef.current === 'reading' ? baseFontRef.current * 0.5 : baseFontRef.current })
    }

    gsap.set(card, { autoAlpha: 0, x: cardSide * 60, clipPath: closedClip })
    gsap.set(ruleRef.current, { scaleX: 0 })
    gsap.set(descRef.current, { clipPath: TEXT_CLOSED, y: 10 })
    cardParked.current = true
    applyBase()
    if (document.fonts?.ready) document.fonts.ready.then(applyBase)
    window.addEventListener('resize', applyBase)

    return () => {
      window.removeEventListener('resize', applyBase)
      cardTl.current?.kill()
      gsap.killTweensOf([card, title, ruleRef.current, descRef.current])
      split.revert()
      splitRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── card + text: entry / exit / entering↔reading ──
  useEffect(() => {
    const prev = prevState.current
    prevState.current = state
    if (prev === state) return

    const wasActive = prev !== 'idle'
    const nowActive = state !== 'idle'
    const card = cardRef.current
    const title = titleRef.current
    const chars = splitRef.current?.chars || []
    const base = baseFontRef.current
    const wantReading = state === 'reading'

    cardTl.current?.kill()
    const tl = gsap.timeline()
    cardTl.current = tl

    if (nowActive && !wasActive) {
      // ENTRY — from parked, snap the start pose; from an interrupted exit, continue from where it is
      if (cardParked.current) {
        gsap.set(card, { autoAlpha: 0, x: cardSide * 60, clipPath: closedClip })
        gsap.set(chars, { opacity: 0, yPercent: 110, rotate: 5 })
        gsap.set(title, { fontSize: wantReading ? base * 0.5 : base })
        gsap.set(ruleRef.current, { scaleX: wantReading ? 1 : 0 })
        gsap.set(descRef.current, { clipPath: wantReading ? TEXT_OPEN : TEXT_CLOSED, y: wantReading ? 0 : 10 })
      }
      cardParked.current = false
      tl.set(card, { autoAlpha: 1 }, 0)
      tl.to(card, { clipPath: CARD_OPEN, x: 0, duration: 1.15, ease: 'expo.out' }, 0)
      tl.to(chars, { opacity: 1, yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.035, ease: 'expo.out' }, 0.3)
    } else if (!nowActive && wasActive) {
      // EXIT — lifts straight up and fades (not the wipe used for entry)
      tl.to(card, { y: -70, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, 0)
      tl.add(() => {
        cardParked.current = true
        // reset to the wipe-closed pose, invisibly, so the next entry still wipes open correctly
        gsap.set(card, { y: 0, x: cardSide * 60, clipPath: closedClip })
      })
    } else {
      // INTERMEDIATE — entering ↔ reading: title tightens, rule draws, copy wipes in (and the reverse)
      tl.to(title, { fontSize: wantReading ? base * 0.5 : base, duration: 0.95, ease: 'power3.inOut' }, 0)
      tl.to(ruleRef.current, { scaleX: wantReading ? 1 : 0, duration: 0.8, ease: 'power2.inOut' }, wantReading ? 0.1 : 0)
      tl.to(
        descRef.current,
        { clipPath: wantReading ? TEXT_OPEN : TEXT_CLOSED, y: wantReading ? 0 : 10, duration: 0.85, ease: 'power2.inOut' },
        wantReading ? 0.25 : 0,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  // ── the 3D model: fly in from its side / fly out through the same side ──
  useEffect(() => {
    if (!modelReady) return
    const outer = outerRef.current
    const spin = spinRef.current
    const park = () => modelSide * (boundsRef.current.halfWidth + 1.8)

    // first time only: place the model and create the (paused) turntable spin
    if (!idleSpin.current) {
      idleSpin.current = gsap.to(spin.rotation, {
        y: `+=${Math.PI * 2}`,
        duration: 32,
        ease: 'none',
        repeat: -1,
        paused: true,
      })
      outer.position.x = isActive ? 0 : park()
      outer.scale.setScalar(isActive ? 1 : 0.7)
      modelParked.current = !isActive
      if (isActive) idleSpin.current.play()
      prevModelActive.current = isActive
      return
    }
    if (prevModelActive.current === isActive) return
    prevModelActive.current = isActive

    modelTl.current?.kill()
    const tl = gsap.timeline()
    modelTl.current = tl

    if (isActive) {
      setRenderOn(true)
      if (modelParked.current) {
        // snap to the start pose: just off-screen on its own side, small, mid-spin
        outer.position.x = park()
        outer.scale.setScalar(0.7)
        outer.rotation.y = -modelSide * Math.PI * 1.3
      }
      modelParked.current = false
      resumeIdleSpin()
      tl.to(outer.position, { x: 0, duration: 1.6, ease: 'power4.out' }, 0.05)
      tl.to(outer.scale, { x: 1, y: 1, z: 1, duration: 1.4, ease: 'back.out(1.4)' }, 0.05)
      tl.to(outer.rotation, { y: 0, duration: 1.7, ease: 'power3.out' }, 0.05)
    } else {
      tl.to(outer.position, { x: park(), duration: 1.0, ease: 'power3.in' }, 0)
      tl.to(outer.scale, { x: 0.7, y: 0.7, z: 0.7, duration: 0.9, ease: 'power2.in' }, 0)
      tl.to(outer.rotation, { y: modelSide * Math.PI * 0.9, duration: 1.0, ease: 'power2.in' }, 0)
      tl.add(() => {
        modelParked.current = true
        outer.rotation.y = 0
        idleSpin.current?.pause()
        setRenderOn(false)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, modelReady])

  // let the canvas warm up (shader compile, model load) briefly, then stop
  // drawing while this category is off-screen
  const activeRef = useRef(isActive)
  activeRef.current = isActive
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!activeRef.current) setRenderOn(false)
    }, 2000)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(
    () => () => {
      cardTl.current?.kill()
      modelTl.current?.kill()
      idleSpin.current?.kill()
      idleSpin.current = null
    },
    [],
  )

  // ── hover-follow: while the cursor is over the model it tracks that
  // movement directly; the moment the cursor leaves, it hands back to the
  // normal vertical-axis auto-spin. No click needed. ──
  const isHoveringRef = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const isActiveRef = useRef(isActive)
  isActiveRef.current = isActive

  const resumeIdleSpin = useCallback(() => {
    idleSpin.current?.kill()
    idleSpin.current = gsap.to(spinRef.current.rotation, {
      y: `+=${Math.PI * 2}`,
      duration: 32,
      ease: 'none',
      repeat: -1,
    })
  }, [])

  const handleHoverEnter = useCallback(
    (e) => {
      if (!modelReady || !isActiveRef.current) return
      isHoveringRef.current = true
      lastPointer.current = { x: e.clientX, y: e.clientY }
      document.body.style.cursor = 'grab'
      idleSpin.current?.kill() // hand-off: no tween should own rotation while the cursor does
    },
    [modelReady],
  )

  const handleHoverMove = useCallback((e) => {
    if (!isHoveringRef.current) return
    const dx = e.clientX - lastPointer.current.x
    const dy = e.clientY - lastPointer.current.y
    lastPointer.current = { x: e.clientX, y: e.clientY }
    const spin = spinRef.current
    if (!spin) return
    spin.rotation.y += dx * 0.011
    spin.rotation.x = Math.max(-0.55, Math.min(0.55, spin.rotation.x + dy * 0.011))
  }, [])

  const endHover = useCallback(() => {
    if (!isHoveringRef.current) return
    isHoveringRef.current = false
    document.body.style.cursor = 'auto'
    if (!spinRef.current) return
    gsap.to(spinRef.current.rotation, { x: 0, duration: 0.7, ease: 'power2.out' })
    if (isActiveRef.current) resumeIdleSpin()
  }, [resumeIdleSpin])

  // if this layer goes idle (or unmounts) while the cursor is still over the
  // model, end the hover state cleanly instead of leaving it stuck
  useEffect(() => {
    if (!isActive) endHover()
  }, [isActive, endHover])
  useEffect(() => () => endHover(), [endHover])

  const handleCardEnter = () => {
    if (spinRef.current) gsap.to(spinRef.current.scale, { x: 1.08, y: 1.08, z: 1.08, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
  }
  const handleCardLeave = () => {
    if (spinRef.current) gsap.to(spinRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
  }

  return (
    <div className="cat-layer" style={{ pointerEvents: isActive ? 'auto' : 'none' }} aria-hidden={!isActive}>
      <div className={`cat-layer__inner ${category.reversed ? 'is-reversed' : ''}`}>
        <div className="cat-layer__text-col">
          <Link
            ref={cardRef}
            to={`/category/${category.name}`}
            className={`cat-layer__card ${reading ? 'is-reading' : ''}`}
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}
            tabIndex={isActive ? 0 : -1}
          >
            <span className="mono cat-layer__index">
              {LABEL_TOTAL}
            </span>
            <h2 ref={titleRef} className="display cat-layer__title">
              {category.name}
            </h2>
            <span ref={ruleRef} className="cat-layer__rule" />
            <p ref={descRef} className="cat-layer__desc">
              {category.description}
            </p>
            <span className="mono cat-layer__cta">
              Browse {category.name} <span className="cat-layer__arrow">→</span>
            </span>
          </Link>
        </div>

        <div ref={canvasWrapRef} className="cat-layer__canvas">
          <Canvas
            dpr={[1, 1.75]}
            frameloop={renderOn ? 'always' : 'never'}
            gl={{ alpha: true, antialias: true }}
            camera={{ fov: 38, position: [0, 0, 5] }}
          >
            <LineArtModel
              url={category.model}
              shape={category.shape}
              color={lineColor}
              edgeAngle={category.edgeAngle}
              tilt={category.tilt}
              baseRotation={category.baseRotation}
              outerRef={setOuter}
              spinRef={setSpin}
              boundsRef={boundsRef}
              onHoverEnter={handleHoverEnter}
              onHoverMove={handleHoverMove}
              onHoverLeave={endHover}
            />
          </Canvas>
        </div>
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
        .cat-layer__inner.is-reversed {
          flex-direction: row-reverse;
        }
        .cat-layer__text-col {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 5vw;
          min-width: 0;
        }
        .cat-layer__card {
          position: relative;
          z-index: 1;
          display: block;
          width: min(100%, 700px);
          padding: 34px 38px 30px;
          background: var(--bg-raised);
          border: 1px solid var(--border-strong);
          border-radius: 6px;
          opacity: 0;
          visibility: hidden;
          cursor: pointer;
          transition: border-color 0.5s ease, box-shadow 0.5s ease;
        }
        .cat-layer__card.is-reading,
        .cat-layer__card:hover {
          border-color: var(--accent);
        }
        .cat-layer__card:hover {
          box-shadow: 0 22px 44px -26px rgba(var(--shadow-color), 0.55);
        }
        .cat-layer__index {
          display: block;
          color: var(--text-secondary);
          margin-bottom: 14px;
        }
        .cat-layer__title {
          display: inline-block;
          max-width: 100%;
          font-size: clamp(3.4rem, 9.5vw, 8.5rem);
          color: var(--text);
          transition: color 0.3s ease;
        }
        .cat-layer__card:hover .cat-layer__title {
          color: var(--accent-soft);
        }
        .cat-layer__rule {
          display: block;
          height: 2px;
          width: 100%;
          margin: 22px 0;
          background: var(--accent);
          box-shadow: 0 0 10px 0 var(--accent);
          transform-origin: left center;
        }
        .cat-layer__desc {
          max-width: 42ch;
          font-size: 1.1rem;
        }
        .cat-layer__cta {
          display: inline-flex;
          gap: 8px;
          margin-top: 22px;
          color: var(--accent-soft);
        }
        .cat-layer__arrow {
          display: inline-block;
          transition: transform 0.3s var(--ease-settle);
        }
        .cat-layer__card:hover .cat-layer__arrow {
          transform: translateX(6px);
        }
        .cat-layer__canvas {
          flex: 1;
          height: 100%;
          min-width: 0;
        }
      `}</style>
    </div>
  )
}
