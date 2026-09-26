import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useListings } from '../context/ListingsContext.jsx'
import { useUI } from '../context/UIContext.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import SearchBar from '../components/SearchBar.jsx'

export default function CategoryPage() {
  const { name } = useParams()
  const { listings } = useListings()
  const { setNavVisible } = useUI()
  const [query, setQuery] = useState('')

  useEffect(() => {
    setNavVisible(true)
  }, [setNavVisible])

  const filtered = useMemo(() => {
    return listings.filter((item) => {
      if (item.category !== name) return false
      if (!query.trim()) return true
      return item.title.toLowerCase().includes(query.trim().toLowerCase())
    })
  }, [listings, name, query])

  return (
    <main className="page">
      <h1 className="page__title">{name}</h1>
      <SearchBar query={query} onQueryChange={setQuery} />
      <ProductGrid products={filtered} emptyMessage={`No ${name} listings yet.`} />

      <style>{`
        .page {
          max-width: 1100px;
          margin: 0 auto;
          padding: 100px 24px 60px;
        }
        .page__title {
          font-size: 2rem;
          margin-bottom: 20px;
        }
      `}</style>
    </main>
  )
}
