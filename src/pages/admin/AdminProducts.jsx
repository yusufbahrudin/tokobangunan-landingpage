import { useState, useEffect, useCallback } from 'react'
import { productsAPI, categoriesAPI, brandsAPI } from '../../lib/api'
import { formatCurrency, getImageUrl } from '../../lib/utils'
import {
  Plus, Search, Edit2, Trash2, Package, X,
  CheckCircle2, XCircle, Star, Loader2, Image as ImageIcon,
} from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  name: '', description: '', sku: '', price: '',
  promo_price: '', stock: '', unit: 'pcs', weight: '',
  shipping_info: '', shipping_days: '', free_shipping: false,
  is_active: true, is_featured: false,
  category_id: '', brand_id: '',
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10, sort: 'created_at', order: 'DESC' }
      if (search) params.search = search
      const { data } = await productsAPI.getAll(params)
      setProducts(data.data?.products || data.data || [])
      setMeta(data.meta || { total: 0, totalPages: 1, page: 1 })
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    categoriesAPI.getAll({ is_active: true }).then(({ data }) => setCategories(data.data || [])).catch(() => {})
    brandsAPI.getAll({ is_active: true }).then(({ data }) => setBrands(data.data || [])).catch(() => {})
  }, [])

  const openCreate = () => {
    setEditProduct(null)
    setForm(EMPTY_FORM)
    setImageFiles([])
    setModalOpen(true)
  }

  const openEdit = (product) => {
    setEditProduct(product)
    setForm({
      name: product.name || '',
      description: product.description || '',
      sku: product.sku || '',
      price: product.price || '',
      promo_price: product.promo_price || '',
      stock: product.stock ?? '',
      unit: product.unit || 'pcs',
      weight: product.weight || '',
      shipping_info: product.shipping_info || '',
      shipping_days: product.shipping_days || '',
      free_shipping: product.free_shipping || false,
      is_active: product.is_active ?? true,
      is_featured: product.is_featured || false,
      category_id: product.category?.id || '',
      brand_id: product.brand?.id || '',
    })
    setImageFiles([])
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) fd.append(k, v)
      })
      imageFiles.forEach((f) => fd.append('images', f))

      if (editProduct) {
        await productsAPI.update(editProduct.id, fd)
        toast.success('Produk berhasil diperbarui')
      } else {
        await productsAPI.create(fd)
        toast.success('Produk berhasil ditambahkan')
      }
      setModalOpen(false)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan produk')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await productsAPI.delete(id)
      toast.success('Produk berhasil dihapus')
      setDeleteConfirm(null)
      fetchProducts()
    } catch {
      toast.error('Gagal menghapus produk')
    }
  }

  const fc = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: val }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Produk</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} total produk</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="input pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Produk</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Kategori</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Harga</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Stok</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gray-200 rounded-lg" /><div className="h-4 bg-gray-200 rounded w-32" /></div></td>
                  <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                  <td className="px-4 py-3 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto" /></td>
                  <td className="px-4 py-3 hidden lg:table-cell text-center"><div className="h-4 bg-gray-200 rounded w-10 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><div className="h-6 bg-gray-200 rounded-full w-14 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><div className="h-8 bg-gray-200 rounded w-16 mx-auto" /></td>
                </tr>
              )) : products.length > 0 ? products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getImageUrl(p.images?.[0])}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                        onError={(e) => { e.target.src = 'https://placehold.co/40x40/f3f4f6/9ca3af?text=?' }}
                      />
                      <div>
                        <p className="font-semibold text-gray-900 truncate max-w-[180px]">{p.name}</p>
                        {p.sku && <p className="text-xs text-gray-400">SKU: {p.sku}</p>}
                        {p.is_featured && <span className="text-[10px] text-amber-600 flex items-center gap-0.5"><Star size={9} fill="currentColor" /> Unggulan</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{p.category?.name || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(p.promo_price || p.price)}</p>
                    {p.promo_price && <p className="text-xs text-gray-400 line-through">{formatCurrency(p.price)}</p>}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-center">
                    <span className={`font-semibold ${p.stock <= 5 ? 'text-red-600' : p.stock <= 20 ? 'text-amber-600' : 'text-gray-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={p.is_active ? 'badge-active' : 'badge-inactive'}>
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteConfirm(p)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                  <Package size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Belum ada produk</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Halaman {page} dari {meta.totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Sebelumnya</button>
              <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Berikutnya</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Produk *</label>
                  <input value={form.name} onChange={fc('name')} className="input" placeholder="Nama produk" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">SKU</label>
                  <input value={form.sku} onChange={fc('sku')} className="input" placeholder="SMN-TR-50KG" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Satuan</label>
                  <input value={form.unit} onChange={fc('unit')} className="input" placeholder="pcs, sak, kaleng..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Harga Normal *</label>
                  <input type="number" value={form.price} onChange={fc('price')} className="input" placeholder="85000" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Harga Promo</label>
                  <input type="number" value={form.promo_price} onChange={fc('promo_price')} className="input" placeholder="75000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stok *</label>
                  <input type="number" value={form.stock} onChange={fc('stock')} className="input" placeholder="100" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Berat (kg)</label>
                  <input type="number" step="0.1" value={form.weight} onChange={fc('weight')} className="input" placeholder="50" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kategori</label>
                  <select value={form.category_id} onChange={fc('category_id')} className="input">
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Brand</label>
                  <select value={form.brand_id} onChange={fc('brand_id')} className="input">
                    <option value="">-- Pilih Brand --</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Info Pengiriman</label>
                  <input value={form.shipping_info} onChange={fc('shipping_info')} className="input" placeholder="Pengiriman 1-3 hari kerja..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Estimasi Hari</label>
                  <input type="number" value={form.shipping_days} onChange={fc('shipping_days')} className="input" placeholder="3" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                  <textarea value={form.description} onChange={fc('description')} className="input resize-none" rows={3} placeholder="Deskripsi produk..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Gambar Produk</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImageFiles(Array.from(e.target.files))}
                    className="input text-sm"
                  />
                  {imageFiles.length > 0 && <p className="text-xs text-gray-500 mt-1">{imageFiles.length} file dipilih</p>}
                </div>
                <div className="sm:col-span-2 flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={fc('is_active')} className="w-4 h-4 accent-primary-600" />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={fc('is_featured')} className="w-4 h-4 accent-primary-600" />
                    <span className="text-sm font-medium text-gray-700">Produk Unggulan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.free_shipping} onChange={fc('free_shipping')} className="w-4 h-4 accent-primary-600" />
                    <span className="text-sm font-medium text-gray-700">Gratis Ongkir</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : (editProduct ? 'Perbarui' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Produk?</h3>
            <p className="text-sm text-gray-500 mb-5">Produk <strong>{deleteConfirm.name}</strong> akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 justify-center">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="btn-danger flex-1 justify-center">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
