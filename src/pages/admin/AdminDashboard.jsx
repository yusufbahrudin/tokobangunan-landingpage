import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productsAPI, categoriesAPI, brandsAPI, adminUsersAPI } from '../../lib/api'
import { formatCurrency, getImageUrl } from '../../lib/utils'
import {
  Package, Tag, Bookmark, Users, TrendingUp,
  ArrowUpRight, AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  return (
    <Link to={to} className="card p-5 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, brands: 0, users: 0 })
  const [recentProducts, setRecentProducts] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prods, cats, brnds, usrs, recent] = await Promise.allSettled([
          productsAPI.getAll({ limit: 1, page: 1 }),
          categoriesAPI.getAll({ limit: 1 }),
          brandsAPI.getAll({ limit: 1 }),
          adminUsersAPI.getAll({ limit: 1 }),
          productsAPI.getAll({ limit: 6, sort: 'created_at', order: 'DESC' }),
        ])
        setStats({
          products: prods.status === 'fulfilled' ? (prods.value.data.meta?.total || 0) : 0,
          categories: cats.status === 'fulfilled' ? (cats.value.data.meta?.total || cats.value.data.data?.length || 0) : 0,
          brands: brnds.status === 'fulfilled' ? (brnds.value.data.meta?.total || brnds.value.data.data?.length || 0) : 0,
          users: usrs.status === 'fulfilled' ? (usrs.value.data.meta?.total || 0) : 0,
        })
        if (recent.status === 'fulfilled') {
          const allProds = recent.value.data.data?.products || recent.value.data.data || []
          setRecentProducts(allProds)
          setLowStock(allProds.filter((p) => p.stock !== undefined && p.stock <= 10))
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const STATS = [
    { icon: Package, label: 'Total Produk', value: stats.products, color: 'bg-blue-500', to: '/admin/products' },
    { icon: Tag, label: 'Kategori', value: stats.categories, color: 'bg-green-500', to: '/admin/categories' },
    { icon: Bookmark, label: 'Brand', value: stats.brands, color: 'bg-purple-500', to: '/admin/brands' },
    { icon: Users, label: 'Pengguna', value: stats.users, color: 'bg-primary-500', to: '/admin/users' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Selamat datang di panel admin TB. CAHAYA ALAM</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => <StatCard key={s.label} {...s} />)}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Products */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock size={16} className="text-gray-400" /> Produk Terbaru
            </h2>
            <Link to="/admin/products" className="text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1">
              Lihat Semua <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            )) : recentProducts.length > 0 ? recentProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                <img
                  src={getImageUrl(p.images?.[0])}
                  alt={p.name}
                  className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                  onError={(e) => { e.target.src = 'https://placehold.co/40x40/f3f4f6/9ca3af?text=?' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.category?.name || '-'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(p.promo_price || p.price)}</p>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {p.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="px-5 py-10 text-center text-gray-400 text-sm">Belum ada produk</div>
            )}
          </div>
        </div>

        {/* Quick actions + Low stock */}
        <div className="space-y-4">
          {/* Quick actions */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-gray-400" /> Aksi Cepat
            </h2>
            <div className="space-y-2">
              <Link to="/admin/products" className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Package size={15} className="text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Tambah Produk</span>
                </div>
                <ArrowUpRight size={14} className="text-blue-400" />
              </Link>
              <Link to="/admin/categories" className="flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Tag size={15} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Tambah Kategori</span>
                </div>
                <ArrowUpRight size={14} className="text-green-400" />
              </Link>
              <Link to="/admin/brands" className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Bookmark size={15} className="text-purple-600" />
                  <span className="text-sm font-semibold text-purple-700">Tambah Brand</span>
                </div>
                <ArrowUpRight size={14} className="text-purple-400" />
              </Link>
              <Link to="/admin/users" className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Users size={15} className="text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">Kelola Pengguna</span>
                </div>
                <ArrowUpRight size={14} className="text-blue-400" />
              </Link>
            </div>
          </div>

          {/* Low stock */}
          {lowStock.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" /> Stok Menipis
              </h2>
              <div className="space-y-2">
                {lowStock.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 truncate flex-1">{p.name}</span>
                    <span className={`text-xs font-bold ml-2 px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                      {p.stock === 0 ? 'Habis' : `${p.stock} sisa`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
