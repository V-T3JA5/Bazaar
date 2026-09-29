import { createContext, useCallback, useContext, useState } from 'react'
import * as storage from '../data/storage'

const ListingsContext = createContext(null)

export function ListingsProvider({ children }) {
  const [listings, setListings] = useState(() => storage.getAllListings())

  const refresh = useCallback(() => {
    setListings(storage.getAllListings())
  }, [])

  const addListing = useCallback((data) => {
    const listing = storage.createListing(data)
    refresh()
    return listing
  }, [refresh])

  const editListing = useCallback((id, password, updates) => {
    const result = storage.updateListing(id, password, updates)
    if (result.ok) refresh()
    return result
  }, [refresh])

  const removeListing = useCallback((id, password) => {
    const result = storage.deleteListing(id, password)
    if (result.ok) refresh()
    return result
  }, [refresh])

  const verifyPassword = useCallback((id, password) => storage.verifyPassword(id, password), [])

  const value = {
    listings,
    categories: storage.CATEGORIES,
    addListing,
    editListing,
    removeListing,
    verifyPassword,
    refresh,
  }

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>
}

export function useListings() {
  const ctx = useContext(ListingsContext)
  if (!ctx) throw new Error('useListings must be used within ListingsProvider')
  return ctx
}
