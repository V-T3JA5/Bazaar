import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { useUI } from '../context/UIContext.jsx'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function HeroSection() {
  const trackRef = useRef(null)
  const titleRef = useRef(null)
  const bylineRef = useRef(null)
  const { setNavVisible } = useUI()
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    setNavVisible(false)
    let split = null

    const ctx = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(bylineRef.current, { opacity: 1 })
        ScrollTrigger.create({
          trigger: trackRef.current,
          start: 'bottom top',
          onEnter: () => setNavVisible(true),
          onLeaveBack: () => setNavVisible(false),
        })
        return
      }

      // --- the one authored focal moment: the wordmark assembles itself ---
      split = new SplitText(titleRef.current, { type: 'chars' })
      gsap.set(split.chars, { display: 'inline-block' })
      const intro = gsap.timeline({ delay: 0.15 })
      intro
        .from(split.chars, {
          yPercent: 120,
          rotate: 6,
          opacity: 0,
          duration: 0.9,
          stagger: 0.045,
          ease: 'expo.out',
        })
        .to(bylineRef.current, { opacity: 1, duration: 0.6, ease: 'power1.out' }, '-=0.3')

      // --- shrink + lock into the nav on scroll ---
      gsap.to(titleRef.current, {
        scale: 0.22,
        y: '-42vh',
        letterSpacing: '-0.01em',
        ease: 'none',
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
          pin: trackRef.current.querySelector('.hero__pin'),
          pinSpacing: true,
          onLeave: () => setNavVisible(true),
          onEnterBack: () => setNavVisible(false),
        },
      })
      gsap.to(bylineRef.current, {
        opacity: 0,
        y: -16,
        ease: 'none',
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: '40% top',
          scrub: 1,
        },
      })
    }, trackRef)

    return () => {
      ctx.revert() // undoes tweens/ScrollTriggers first
      if (split) split.revert() // then restores the original text node
    }
  }, [reduceMotion, setNavVisible])

  return (
    <section ref={trackRef} className="hero-track">
      <div className="hero__pin">
        <h1 ref={titleRef} className="display hero__title">
          Bazaar
        </h1>
        <p ref={bylineRef} className="mono hero__byline">
          by T
        </p>
      </div>

      <style>{`
        .hero-track {
          height: 180vh;
        }
        .hero__pin {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 18px;
          text-align: center;
          padding: 0 20px;
        }
        .hero__title {
          font-size: clamp(4.5rem, 22vw, 13rem);
          transform-origin: center top;
        }
        .hero__byline {
          color: var(--text-secondary);
          opacity: 0;
        }
      `}</style>
    </section>
  )
}
