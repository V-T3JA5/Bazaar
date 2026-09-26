import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useUI } from '../context/UIContext.jsx'
import { useMediaQuery } from '../hooks/useMediaQuery.js'

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const trackRef = useRef(null)
  const titleRef = useRef(null)
  const searchWrapRef = useRef(null)
  const { setNavVisible } = useUI()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    setNavVisible(false)

    if (reduceMotion) {
      // No shrink/scrub animation — just reveal the nav once the hero has
      // scrolled by, via a plain (non-scrubbed) trigger.
      const st = ScrollTrigger.create({
        trigger: trackRef.current,
        start: 'bottom top',
        onEnter: () => setNavVisible(true),
        onLeaveBack: () => setNavVisible(false),
      })
      return () => st.kill()
    }

    const ctx = gsap.context(() => {
      gsap.to(titleRef.current, {
        scale: 0.32,
        y: '-42vh',
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
      gsap.to(searchWrapRef.current, {
        opacity: 0,
        y: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: trackRef.current,
          start: 'top top',
          end: '55% top',
          scrub: 1,
        },
      })
    }, trackRef)

    return () => ctx.revert()
  }, [reduceMotion, setNavVisible])

  const submitSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/discover?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <section ref={trackRef} className="hero-track">
      <div className="hero__pin">
        <h1 ref={titleRef} className="hero__title">
          Campus Marketplace
        </h1>
        <div ref={searchWrapRef} className="hero__search-wrap">
          <form className="hero__search" onSubmit={submitSearch}>
            <input
              type="search"
              placeholder="Search for textbooks, chargers, mini fridges…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="btn btn--accent">
              Search
            </button>
          </form>
        </div>
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
          gap: 28px;
          text-align: center;
          padding: 0 20px;
        }
        .hero__title {
          font-size: clamp(2.6rem, 9vw, 6rem);
          transform-origin: center top;
        }
        .hero__search-wrap {
          width: min(560px, 90vw);
        }
        .hero__search {
          display: flex;
          gap: 8px;
          background: var(--bg-raised);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 8px;
        }
        .hero__search input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--text);
          font-size: 1rem;
          padding: 10px 12px;
        }
        .hero__search input:focus {
          outline: none;
        }
        .btn {
          border-radius: 10px;
          padding: 10px 18px;
          font-weight: 600;
          border: 1px solid transparent;
        }
        .btn--accent {
          background: var(--accent);
          color: var(--accent-text);
        }
      `}</style>
    </section>
  )
}
