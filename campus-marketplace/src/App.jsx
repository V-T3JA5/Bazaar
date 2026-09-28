import { Routes, Route } from 'react-router-dom'
import TopNav from './components/TopNav.jsx'
import Sidebar from './components/Sidebar.jsx'
import ProductForm from './components/ProductForm.jsx'
import ProductModal from './components/ProductModal.jsx'
import Home from './pages/Home.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import DiscoverPage from './pages/DiscoverPage.jsx'

export default function App() {
  return (
    <>
      <TopNav />
      <Sidebar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category/:name" element={<CategoryPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
      </Routes>

      <ProductForm />
      <ProductModal />
    </>
  )
}
