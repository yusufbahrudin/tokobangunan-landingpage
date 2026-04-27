import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Search, ShoppingBag, Menu, X, ChevronDown,
  User, LayoutDashboard, LogOut, Phone, MapPin,
} from 'lucide-react'
import { categoriesAPI } from '../../lib/api'

const CATEGORIES = [
  'Bahan Bangunan', 'Cat & Finishing', 'Perkakas', 'Keramik & Granit',
  'Sanitasi', 'Listrik', 'Atap', 'Pintu & Jendela',
]

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [catMenuOpen, setCatMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    categoriesAPI.getAll({ is_active: true, parent_id: 'null' })
      .then(({ data }) => setCategories(data.data?.slice(0, 8) || []))
      .catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <>
      {/* Top bar */}
      <div className="bg-primary-700 text-white text-xs py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin size={11} /> Tersedia di seluruh Indonesia</span>
          </div>
          <span className="font-medium">Gratis Ongkir untuk pembelian minimal Rp 500.000</span>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <ShoppingBag size={20} className="text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-extrabold text-gray-900 leading-none text-[17px]">Galangan</div>
                <div className="text-primary-600 text-[11px] font-semibold leading-none">Rizal</div>
              </div>
            </Link>

            {/* Category dropdown */}
            <div className="hidden lg:block relative">
              <button
                onMouseEnter={() => setCatMenuOpen(true)}
                onMouseLeave={() => setCatMenuOpen(false)}
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors py-2"
              >
                <Menu size={16} />
                Kategori
                <ChevronDown size={14} className={`transition-transform ${catMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {catMenuOpen && (
                <div
                  className="absolute left-0 top-full w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                  onMouseEnter={() => setCatMenuOpen(true)}
                  onMouseLeave={() => setCatMenuOpen(false)}
                >
                  {(categories.length > 0 ? categories : CATEGORIES.map((n, i) => ({ id: i, name: n, slug: n.toLowerCase().replace(/ /g, '-') }))).map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category_id=${cat.id}`}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      onClick={() => setCatMenuOpen(false)}
                    >
                      {cat.name}
                    </Link>
                  ))}
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <Link
                      to="/products"
                      className="block px-4 py-2.5 text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-colors"
                      onClick={() => setCatMenuOpen(false)}
                    >
                      Lihat Semua Produk →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 hidden sm:flex items-center">
              <div className="relative w-full max-w-2xl">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk bahan bangunan..."
                  className="w-full h-10 pl-4 pr-12 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-white transition"
                />
                <button type="submit" className="absolute right-1 top-1 h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center hover:bg-primary-700 transition-colors">
                  <Search size={14} className="text-white" />
                </button>
              </div>
            </form>

            {/* Right actions */}
            <div className="flex items-center gap-2 ml-auto">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-primary-600 transition-colors bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5"
                  >
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden md:block">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={14} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-semibold text-sm text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        >
                          <LayoutDashboard size={15} /> Dashboard Admin
                        </Link>
                      )}
                      <button
                        onClick={() => { handleLogout(); setUserMenuOpen(false) }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
                >
                  <User size={15} />
                  <span className="hidden sm:block">Masuk</span>
                </Link>
              )}

              {/* Mobile menu btn */}
              <button
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden pb-3">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full h-10 pl-4 pr-12 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <button type="submit" className="absolute right-1 top-1 h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <Search size={14} className="text-white" />
                </button>
              </div>
            </form>
          </div>

          {/* Category nav bar */}
          <div className="hidden lg:flex items-center gap-1 pb-2 border-t border-gray-100 pt-2 overflow-x-auto no-scrollbar">
            <Link to="/products" className="text-xs font-semibold text-primary-600 whitespace-nowrap px-2 py-1 rounded hover:bg-primary-50">
              Semua Produk
            </Link>
            {(categories.length > 0 ? categories : CATEGORIES.map((n, i) => ({ id: i, name: n }))).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category_id=${cat.id}`}
                className="text-xs text-gray-600 whitespace-nowrap px-2 py-1 rounded hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white py-3 px-4 space-y-1">
            <Link to="/" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Beranda</Link>
            <Link to="/products" className="block py-2 text-sm font-medium text-gray-700" onClick={() => setMobileOpen(false)}>Semua Produk</Link>
            {(categories.length > 0 ? categories.slice(0, 6) : []).map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category_id=${cat.id}`}
                className="block py-2 text-sm text-gray-600 pl-3"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </>
  )
}
