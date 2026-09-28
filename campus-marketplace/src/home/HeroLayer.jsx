import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)

export default function HeroLayer({ active, reduceMotion }) {
  const rootRef = useRef(null)
  const titleRef = useRef(null)
  const bylineRef = useRef(null)

  // one-time entrance, on mount only
  useEffect(() => {
    if (reduceMotion) {
      gsap.set([titleRef.current, bylineRef.current], { opacity: 1 })
      return undefined
    }

    let split = null
    const ctx = gsap.context(() => {
      split = new SplitText(titleRef.current, { type: 'chars' })
      gsap.set(split.chars, { display: 'inline-block' })
      gsap
        .timeline({ delay: 0.2 })
        .from(split.chars, {
          yPercent: 120,
          rotate: 6,
          opacity: 0,
          duration: 0.9,
          stagger: 0.045,
          ease: 'expo.out',
        })
        .to(bylineRef.current, { opacity: 1, duration: 0.6, ease: 'power1.out' }, '-=0.3')
    }, rootRef)

    return () => {
      ctx.revert()
      if (split) split.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion])

  // fade in/out on every active change — including possibly mid-entrance,
  // which is fine: hiding a still-animating element causes no conflict,
  // it just disappears as a unit
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(rootRef.current, {
        opacity: active ? 1 : 0,
        scale: active ? 1 : 0.9,
        filter: active ? 'blur(0px)' : 'blur(6px)',
        duration: 0.6,
        ease: 'power2.out',
      })
    }, rootRef)
    return () => ctx.revert()
  }, [active])

  return (
    <div
      ref={rootRef}
      className="hero-layer"
      style={{ pointerEvents: active ? 'auto' : 'none' }}
      aria-hidden={!active}
    >
      <h1 ref={titleRef} className="display hero-layer__title">
        Bazaar
      </h1>
      <p ref={bylineRef} className="mono hero-layer__byline" style={{ opacity: reduceMotion ? 1 : 0 }}>
        by T
      </p>

      <style>{`
        .hero-layer {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          text-align: center;
        }
        .hero-layer__title {
          font-size: clamp(4.5rem, 22vw, 13rem);
        }
        .hero-layer__byline {
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  )
}
