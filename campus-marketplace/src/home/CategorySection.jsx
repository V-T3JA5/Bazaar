import { useEffect, useRef } from 'react'
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

  const isDesktop = useMediaQuery('(min-width: 769px)')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const animated = isDesktop && !reduceMotion

  useEffect(() => {
    if (!animated) return undefined

    let cleanupAnimation = () => {}

    // Wait a tick so the R3F canvas has mounted and modelGroupRef is populated.
    const raf = requestAnimationFrame(() => {
      if (!modelGroupRef.current) return

      const side = reversed ? -1 : 1 // model's own side of the screen
      const entryX = side * 3.4
      const restX = 0
      const exitX = side * -3.6 // keeps moving the same direction it entered with

      modelGroupRef.current.position.x = entryX

      const rotationTween = gsap.to(modelGroupRef.current.rotation, {
        y: '+=' + Math.PI * 2,
        duration: 22,
        repeat: -1,
        ease: 'none',
      })

      gsap.set(descRef.current, { opacity: 0, y: 12 })
      gsap.set(cardRef.current, { opacity: 0, y: 24 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=250%',
          scrub: 1,
          pin: true,
        },
      })

      tl.to(modelGroupRef.current.position, { x: restX, duration: 1 }, 0)
        .to(cardRef.current, { opacity: 1, y: 0, duration: 1 }, 0)
        .to(titleRef.current, { scale: 0.6, duration: 1 }, 1.3)
        .to(descRef.current, { opacity: 1, y: 0, duration: 1 }, 1.3)
        .to(cardRef.current, { y: '-30%', opacity: 0, duration: 1 }, 3.1)
        .to(modelGroupRef.current.position, { x: exitX, duration: 1 }, 3.1)

      cleanupAnimation = () => {
        rotationTween.kill()
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    })

    return () => {
      cancelAnimationFrame(raf)
      cleanupAnimation()
    }
  }, [animated, reversed])

  return (
    <section
      ref={sectionRef}
      className={`category-section ${reversed ? 'is-reversed' : ''} ${animated ? '' : 'is-static'}`}
    >
      <div className="category-section__inner">
        <div ref={cardRef} className="category-section__card">
          <h2 ref={titleRef} className="category-section__title">
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
              <PlaceholderModel shape={shape} groupRef={modelGroupRef} />
            </Canvas>
          </div>
        )}
      </div>

      <style>{`
        .category-section {
          height: 100vh;
          display: flex;
          align-items: center;
        }
        .category-section.is-static {
          height: auto;
          padding: 80px 0;
        }
        .category-section__inner {
          width: min(1100px, 92vw);
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 48px;
        }
        .category-section.is-reversed .category-section__inner {
          flex-direction: row-reverse;
        }
        .category-section__card {
          flex: 1;
          min-width: 0;
        }
        .category-section__title {
          font-size: clamp(2.2rem, 6vw, 4rem);
          transform-origin: left center;
        }
        .category-section__desc {
          margin-top: 16px;
          max-width: 46ch;
          font-size: 1.05rem;
        }
        .category-section__canvas {
          flex: 1;
          height: 60vh;
        }
        @media (max-width: 768px) {
          .category-section__inner {
            flex-direction: column !important;
          }
        }
      `}</style>
    </section>
  )
}
