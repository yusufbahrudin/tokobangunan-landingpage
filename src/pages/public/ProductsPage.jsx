import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { productsAPI, categoriesAPI, brandsAPI } from '../../lib/api'
import ProductCard from '../../components/public/ProductCard'
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'created_at:DESC', label: 'Terbaru' },
  { value: 'price:ASC', label: 'Harga Terendah' },
  { value: 'price:DESC', label: 'Harga Tertinggi' },
  { value: 'sold_count:DESC', label: 'Terlaris' },
  { value: 'rating:DESC', label: 'Rating Tertinggi' },
]

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [filterOpen, setFilterOpen] = useState(false)

  const search = searchParams.get('search') || ''
  const categoryId = searchParams.get('category_id') || ''
  const brandId = searchParams.get('brand_id') || ''
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const sortRaw = searchParams.get('sort') || 'created_at:DESC'
  const page = parseInt(searchParams.get('page') || '1')
  const [sortField, sortOrder] = sortRaw.split(':')

  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.set('page', '1')
    setSearchParams(next)
  }

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 12 }
      if (search) params.search = search
      if (categoryId) params.category_id = categoryId
      if (brandId) params.brand_id = brandId
      if (minPrice) params.min_price = minPrice
      if (maxPrice) params.max_price = maxPrice
      params.sort = sortField
      params.order = sortOrder
      const { data } = await productsAPI.getAll(params)
      setProducts(data.data?.products || data.data || [])
      setMeta(data.meta || { total: 0, page: 1, totalPages: 1 })
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [search, categoryId, brandId, minPrice, maxPrice, sortField, sortOrder, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    categoriesAPI.getAll({ is_active: true }).then(({ data }) => setCategories(data.data || [])).catch(() => {})
    brandsAPI.getAll({ is_active: true }).then(({ data }) => setBrands(data.data || [])).catch(() => {})
  }, [])

  const clearFilters = () => {
    setSearchParams({ page: '1' })
    setLocalMin('')
    setLocalMax('')
  }

  const activeFiltersCount = [search, categoryId, brandId, minPrice, maxPrice].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold text-gray-900">
          {search ? `Hasil pencarian: "${search}"` : 'Semua Produk'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{meta.total} produk ditemukan</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters – desktop */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="card p-4 space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">Filter</h3>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Reset ({activeFiltersCount})</button>
              )}
            </div>

            {/* Category */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Kategori</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <button
                  onClick={() => updateParam('category_id', '')}
                  className={`block w-full text-left text-sm px-2 py-1.5 rounded-lg ${!categoryId ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  Semua Kategori
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateParam('category_id', c.id)}
                    className={`block w-full text-left text-sm px-2 py-1.5 rounded-lg ${categoryId === c.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Brand */}
            {brands.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Brand</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  <button
                    onClick={() => updateParam('brand_id', '')}
                    className={`block w-full text-left text-sm px-2 py-1.5 rounded-lg ${!brandId ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    Semua Brand
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => updateParam('brand_id', b.id)}
                      className={`block w-full text-left text-sm px-2 py-1.5 rounded-lg ${brandId === b.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price range */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Rentang Harga</h4>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  className="input text-xs w-full"
                />
                <span className="text-gray-400">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  className="input text-xs w-full"
                />
              </div>
              <button
                onClick={() => {
                  updateParam('min_price', localMin)
                  updateParam('max_price', localMax)
                }}
                className="mt-2 w-full btn-primary text-xs py-2 justify-center"
              >
                Terapkan
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="lg:hidden btn-secondary text-sm py-2 gap-2"
            >
              <SlidersHorizontal size={15} />
              Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500 hidden sm:block">Urutkan:</span>
              <select
                value={sortRaw}
                onChange={(e) => {
                  const next = new URLSearchParams(searchParams)
                  next.set('sort', e.target.value)
                  next.set('page', '1')
                  setSearchParams(next)
                }}
                className="input text-sm py-2 w-auto"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile filter panel */}
          {filterOpen && (
            <div className="lg:hidden card p-4 mb-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Filter</h3>
                <button onClick={() => setFilterOpen(false)}><X size={18} /></button>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Kategori</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => updateParam('category_id', c.id === categoryId ? '' : c.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border ${categoryId === c.id ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Active filter tags */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {search && (
                <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
                  "{search}"
                  <button onClick={() => updateParam('search', '')}><X size={12} /></button>
                </span>
              )}
              {categoryId && (
                <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
                  Kategori dipilih
                  <button onClick={() => updateParam('category_id', '')}><X size={12} /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
                  Harga filter
                  <button onClick={() => { updateParam('min_price', ''); updateParam('max_price', '') }}><X size={12} /></button>
                </span>
              )}
              <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">Hapus semua</button>
            </div>
          )}

          {/* Product grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParam('page', String(page - 1))}
                    className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <span className="flex items-center px-4 text-sm text-gray-600">
                    {page} / {meta.totalPages}
                  </span>
                  <button
                    disabled={page >= meta.totalPages}
                    onClick={() => updateParam('page', String(page + 1))}
                    className="btn-secondary py-2 px-4 text-sm disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-bold text-gray-700 text-lg mb-2">Produk tidak ditemukan</h3>
              <p className="text-gray-400 text-sm mb-6">Coba ubah kata kunci atau filter pencarian Anda</p>
              <button onClick={clearFilters} className="btn-primary">Hapus Filter</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
