import { createContext, useContext, useState } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [navVisible, setNavVisible] = useState(() => window.location.pathname !== '/')

  // form modal: { mode: 'create' | 'edit', product?: object } | null
  const [formModal, setFormModal] = useState(null)
  // detail modal: product object | null
  const [detailProduct, setDetailProduct] = useState(null)

  const openCreateForm = () => {
    setSidebarOpen(false)
    setFormModal({ mode: 'create' })
  }
  const openEditForm = (product, password) => {
    setDetailProduct(null)
    setFormModal({ mode: 'edit', product, password })
  }
  const closeForm = () => setFormModal(null)

  const openDetail = (product) => setDetailProduct(product)
  const closeDetail = () => setDetailProduct(null)

  const value = {
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar: () => setSidebarOpen((v) => !v),
    navVisible,
    setNavVisible,
    formModal,
    openCreateForm,
    openEditForm,
    closeForm,
    detailProduct,
    openDetail,
    closeDetail,
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
