import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import PlaceholderModel from './PlaceholderModel.jsx'

export default function CategoryLayer({ index, category, state, renderCanvas }) {
  const rootRef = useRef(null)
  const cardRef = useRef(null)
  const titleRef = useRef(null)
  const ruleRef = useRef(null)
  const descRef = useRef(null)
  const modelGroupRef = useRef(null)

  const [modelReady, setModelReady] = useState(false)
  const setGroupRef = useCallback((node) => {
    modelGroupRef.current = node
    if (node) setModelReady(true)
  }, [])

  const hasMounted = useRef(false)
  const isActive = state !== 'idle'

  // The model always enters from — and retreats back out — its own side.
  const side = category.reversed ? -1 : 1
  const entryX = side * 3.8

  useEffect(() => {
    const instant = !hasMounted.current
    hasMounted.current = true

    const ctx = gsap.context(() => {
      const dur = instant ? 0 : 0.55

      gsap.to(rootRef.current, { opacity: isActive ? 1 : 0, duration: dur, ease: 'power1.out' })
      gsap.to(cardRef.current, {
        opacity: isActive ? 1 : 0,
        y: isActive ? 0 : 24,
        duration: instant ? 0 : 0.75,
        ease: isActive ? 'power3.out' : 'power2.in',
      })
      gsap.to(titleRef.current, {
        scale: state === 'reading' ? 0.5 : 1,
        duration: instant ? 0 : 0.8,
        ease: 'power2.inOut',
      })
      gsap.to(ruleRef.current, {
        scaleX: state === 'reading' ? 1 : 0,
        duration: instant ? 0 : 0.7,
        ease: 'power2.inOut',
      })
      gsap.to(descRef.current, {
        opacity: state === 'reading' ? 1 : 0,
        y: state === 'reading' ? 0 : 12,
        duration: instant ? 0 : 0.6,
        ease: 'power1.out',
      })

      if (modelReady) {
        if (instant) {
          gsap.set(modelGroupRef.current.position, { x: isActive ? 0 : entryX })
        } else {
          gsap.to(modelGroupRef.current.position, {
            x: isActive ? 0 : entryX,
            duration: isActive ? 1.1 : 0.85,
            ease: isActive ? 'power3.out' : 'power2.in',
          })
        }
      }
    }, rootRef)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, modelReady])

  // continuous slow rotation, only while this category is on screen
  useEffect(() => {
    if (!modelReady || !isActive) return undefined
    const tween = gsap.to(modelGroupRef.current.rotation, {
      y: '+=' + Math.PI * 2,
      duration: 24,
      repeat: -1,
      ease: 'none',
    })
    return () => tween.kill()
  }, [isActive, modelReady])

  const label = String(index + 1).padStart(2, '0')

  return (
    <div
      ref={rootRef}
      className={`cat-layer ${category.reversed ? 'is-reversed' : ''}`}
      style={{ opacity: 0, pointerEvents: isActive ? 'auto' : 'none' }}
      aria-hidden={!isActive}
    >
      <div className="cat-layer__inner">
        <div ref={cardRef} className="cat-layer__card">
          <span className="mono cat-layer__index">
            {label} / 03
          </span>
          <h2 ref={titleRef} className="display cat-layer__title">
            {category.name}
          </h2>
          <span ref={ruleRef} className="cat-layer__rule" />
          <p ref={descRef} className="cat-layer__desc">
            {category.description}
          </p>
        </div>

        {renderCanvas && (
          <div className="cat-layer__canvas">
            <Canvas camera={{ position: [0, 0, 6], fov: 42 }}>
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
          display: flex;
          align-items: center;
        }
        .cat-layer__inner {
          width: min(1150px, 92vw);
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 56px;
        }
        .cat-layer.is-reversed .cat-layer__inner {
          flex-direction: row-reverse;
        }
        .cat-layer__card {
          flex: 1;
          min-width: 0;
        }
        .cat-layer__index {
          display: block;
          color: var(--text-secondary);
          margin-bottom: 14px;
        }
        .cat-layer__title {
          font-size: clamp(3.2rem, 9vw, 7.5rem);
          transform-origin: ${category.reversed ? 'right center' : 'left center'};
        }
        .cat-layer__rule {
          display: block;
          height: 1px;
          width: 100%;
          margin: 22px 0;
          background: var(--border);
          transform: scaleX(0);
          transform-origin: ${category.reversed ? 'right' : 'left'};
        }
        .cat-layer__desc {
          max-width: 42ch;
          font-size: 1.1rem;
        }
        .cat-layer__canvas {
          flex: 1;
          height: 62vh;
        }
      `}</style>
    </div>
  )
}
