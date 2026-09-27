import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PlaceholderModel from './PlaceholderModel.jsx'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

gsap.registerPlugin(ScrollTrigger)

export default function CategorySection({ category, description, shape, reversed }) {
  const sectionRef = useRef(null)
  const cardRef = useRef(null)
  const titleRef = useRef(null)
  const descRef = useRef(null)
  const modelGroupRef = useRef(null)

  // A callback ref (instead of guessing with requestAnimationFrame) tells us
  // the exact moment the R3F canvas has mounted the group, so the timeline
  // below is never built against a null target.
  const [modelReady, setModelReady] = useState(false)
  const setGroupRef = useCallback((node) => {
    modelGroupRef.current = node
    if (node) setModelReady(true)
  }, [])

  const isDesktop = useMediaQuery('(min-width: 769px)')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const animated = isDesktop && !reduceMotion

  // Reduced-motion / mobile: still give the copy a gentle, non-spatial fade
  // in instead of just appearing — "fewer and gentler," not "no motion."
  useEffect(() => {
    if (animated) return undefined
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: 'power1.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [animated])

  useEffect(() => {
    if (!animated || !modelReady || !modelGroupRef.current) return undefined

    const ctx = gsap.context(() => {
      const side = reversed ? -1 : 1 // model's own side of the screen
      const entryX = side * 3.6
      const restX = 0
      const exitX = side * -4.2 // keeps moving the same direction it entered with — never reverses

      modelGroupRef.current.position.x = entryX

      const rotationTween = gsap.to(modelGroupRef.current.rotation, {
        y: '+=' + Math.PI * 2,
        duration: 24,
        repeat: -1,
        ease: 'none',
      })

      gsap.set(descRef.current, { opacity: 0, y: 14 })
      gsap.set(cardRef.current, { opacity: 0, y: 30, scale: 0.97 })
      gsap.set(titleRef.current, { transformOrigin: reversed ? 'right center' : 'left center' })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%',
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })

      // ENTRY — model flies in and settles; card arrives with it.
      tl.to(modelGroupRef.current.position, { x: restX, duration: 1.1, ease: 'power3.out' }, 0)
        .to(cardRef.current, { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: 'power3.out' }, 0)
        // LOCK / READ — title shrinks to make room, description fades in below it.
        // Model position is untouched here: rotation is the only motion.
        .to(titleRef.current, { scale: 0.5, duration: 1, ease: 'power1.inOut' }, 1.6)
        .to(descRef.current, { opacity: 1, y: 0, duration: 1, ease: 'power1.out' }, 1.9)
        // a deliberate hold: nothing scripted here but the rotation, so the
        // reading pause actually registers before exit begins
        // EXIT — card leaves, model continues in the same direction.
        .to(cardRef.current, { y: '-8%', opacity: 0, duration: 1, ease: 'power2.in' }, 3.6)
        .to(modelGroupRef.current.position, { x: exitX, duration: 1, ease: 'power2.in' }, 3.6)

      // no manual cleanup needed here — everything above (rotationTween, tl,
      // its ScrollTrigger) was created inside this context and gsap.context
      // auto-tracks and reverts all of it when ctx.revert() runs below
    }, sectionRef)

    return () => ctx.revert()
  }, [animated, modelReady, reversed])

  return (
    <section
      ref={sectionRef}
      className={`category-section ${reversed ? 'is-reversed' : ''} ${animated ? '' : 'is-static'}`}
    >
      <div className="category-section__inner">
        <div ref={cardRef} className="category-section__card">
          <h2 ref={titleRef} className="display category-section__title">
            {category}
          </h2>
          <p ref={descRef} className="category-section__desc">
            {description}
          </p>
        </div>

        {isDesktop && (
          <div className="category-section__canvas">
            <Canvas camera={{ position: [0, 0, 6], fov: 42 }}>
              <ambientLight intensity={0.7} />
              <PlaceholderModel shape={shape} groupRef={setGroupRef} />
            </Canvas>
          </div>
        )}
      </div>

      <style>{`
        .category-section {
          height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .category-section.is-static {
          height: auto;
          padding: 90px 0;
          overflow: visible;
        }
        .category-section__inner {
          width: min(1150px, 92vw);
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 56px;
        }
        .category-section.is-reversed .category-section__inner {
          flex-direction: row-reverse;
        }
        .category-section__card {
          flex: 1;
          min-width: 0;
        }
        .category-section__title {
          font-size: clamp(3.2rem, 9vw, 7.5rem);
        }
        .category-section__desc {
          margin-top: 20px;
          max-width: 42ch;
          font-size: 1.1rem;
        }
        .category-section__canvas {
          flex: 1;
          height: 62vh;
        }
        @media (max-width: 768px) {
          .category-section__inner {
            flex-direction: column !important;
          }
          .category-section__title {
            font-size: clamp(2.6rem, 14vw, 4rem);
          }
        }
      `}</style>
    </section>
  )
}
