import { useState, useEffect, useCallback } from 'react'
import { brandsAPI } from '../../lib/api'
import { getImageUrl } from '../../lib/utils'
import { Plus, Edit2, Trash2, Search, Bookmark, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { name: '', description: '', is_active: true }

export default function AdminBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [logoFile, setLogoFile] = useState(null)

  const fetchBrands = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await brandsAPI.getAll(search ? { search } : {})
      setBrands(data.data || [])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchBrands() }, [fetchBrands])

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setLogoFile(null); setModalOpen(true) }
  const openEdit = (item) => {
    setEditItem(item)
    setForm({ name: item.name || '', description: item.description || '', is_active: item.is_active ?? true })
    setLogoFile(null)
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) fd.append(k, v) })
      if (logoFile) fd.append('logo', logoFile)
      if (editItem) {
        await brandsAPI.update(editItem.id, fd)
        toast.success('Brand berhasil diperbarui')
      } else {
        await brandsAPI.create(fd)
        toast.success('Brand berhasil ditambahkan')
      }
      setModalOpen(false)
      fetchBrands()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan brand')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await brandsAPI.delete(id)
      toast.success('Brand berhasil dihapus')
      setDeleteConfirm(null)
      fetchBrands()
    } catch {
      toast.error('Gagal menghapus brand')
    }
  }

  const fc = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Brand</h1>
          <p className="text-sm text-gray-500 mt-0.5">{brands.length} brand</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Tambah Brand</button>
      </div>

      <div className="card p-4 mb-5">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari brand..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card p-5 animate-pulse h-28" />)}
        </div>
      ) : brands.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {brands.map((b) => (
            <div key={b.id} className="card p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {b.logo ? (
                  <img src={getImageUrl(b.logo)} alt={b.name} className="w-12 h-12 object-contain rounded-lg border border-gray-100" />
                ) : (
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                    <Bookmark size={20} className="text-purple-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{b.name}</p>
                  {b.description && <p className="text-xs text-gray-500 truncate mt-0.5">{b.description}</p>}
                  <span className={`mt-1.5 inline-block ${b.is_active ? 'badge-active' : 'badge-inactive'}`}>
                    {b.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 mt-3 justify-end">
                <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteConfirm(b)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card py-20 text-center text-gray-400">
          <Bookmark size={40} className="mx-auto mb-3 opacity-30" />
          <p>Belum ada brand</p>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editItem ? 'Edit Brand' : 'Tambah Brand'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Brand *</label>
                <input value={form.name} onChange={fc('name')} className="input" placeholder="Nama brand" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={fc('description')} className="input resize-none" rows={2} placeholder="Deskripsi singkat..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Logo</label>
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0] || null)} className="input text-sm" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={fc('is_active')} className="w-4 h-4 accent-primary-600" />
                <span className="text-sm font-medium text-gray-700">Aktif</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : (editItem ? 'Perbarui' : 'Simpan')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={24} className="text-red-600" /></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Brand?</h3>
            <p className="text-sm text-gray-500 mb-5">Brand <strong>{deleteConfirm.name}</strong> akan dihapus permanen.</p>
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
