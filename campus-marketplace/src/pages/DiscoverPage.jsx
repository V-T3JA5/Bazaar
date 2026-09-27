import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useListings } from '../context/ListingsContext.jsx'
import { useUI } from '../context/UIContext.jsx'
import ProductGrid from '../components/ProductGrid.jsx'
import SearchBar from '../components/SearchBar.jsx'

export default function DiscoverPage() {
  const { listings, categories } = useListings()
  const { setNavVisible } = useUI()
  const [searchParams] = useSearchParams()

  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState('')

  useEffect(() => {
    setNavVisible(true)
  }, [setNavVisible])

  // keep the search box in sync if the person arrives here again via the hero search
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setQuery(q)
  }, [searchParams])

  const filtered = useMemo(() => {
    return listings.filter((item) => {
      if (category && item.category !== category) return false
      if (!query.trim()) return true
      return item.title.toLowerCase().includes(query.trim().toLowerCase())
    })
  }, [listings, query, category])

  return (
    <main className="page">
      <h1 className="page__title">Discover</h1>
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
      />
      <ProductGrid products={filtered} emptyMessage="No listings match your search." />
    </main>
  )
}
