import { useEffect, useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(SplitText)


export default function HeroLayer({ active, reduceMotion }) {
  const rootRef = useRef(null)
  const titleRef = useRef(null)
  const bylineRef = useRef(null)
  const splitRef = useRef(null)
  const introTl = useRef(null)
  const fadeTl = useRef(null)
  const firstRun = useRef(true)

  
  useLayoutEffect(() => {
    if (reduceMotion) {
      gsap.set(bylineRef.current, { opacity: 1 })
      return undefined
    }
    gsap.set(bylineRef.current, { opacity: 0 })
    const split = new SplitText(titleRef.current, { type: 'chars' })
    splitRef.current = split
    gsap.set(split.chars, { display: 'inline-block' })

    introTl.current = gsap
      .timeline({ delay: 0.25 })
      .fromTo(
        split.chars,
        { yPercent: 120, rotate: 6, opacity: 0 },
        { yPercent: 0, rotate: 0, opacity: 1, duration: 0.95, stagger: 0.05, ease: 'expo.out' },
      )
      .to(bylineRef.current, { opacity: 1, duration: 0.7, ease: 'power1.out' }, '-=0.35')

    return () => {
      introTl.current?.kill()
      fadeTl.current?.kill()
      split.revert()
      splitRef.current = null
    }
  }, [reduceMotion])

  
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    fadeTl.current?.kill()
    const chars = splitRef.current?.chars

    if (active) {
      introTl.current?.kill()
      const tl = gsap.timeline()
      tl.to(rootRef.current, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }, 0)
      if (chars) {
        tl.fromTo(
          chars,
          { yPercent: 45, opacity: 0 },
          { yPercent: 0, rotate: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: 'power3.out' },
          0.1,
        )
      }
      tl.to(bylineRef.current, { opacity: 1, duration: 0.5 }, 0.5)
      fadeTl.current = tl
    } else {
      fadeTl.current = gsap.to(rootRef.current, {
        opacity: 0,
        scale: 0.9,
        filter: 'blur(8px)',
        duration: 0.65,
        ease: 'power2.in',
      })
    }
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
      <p ref={bylineRef} className="mono hero-layer__byline">
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
