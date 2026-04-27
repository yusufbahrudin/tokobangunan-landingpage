import { useState, useEffect, useCallback } from 'react'
import { categoriesAPI } from '../../lib/api'
import { getImageUrl } from '../../lib/utils'
import { Plus, Edit2, Trash2, Search, Tag, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { name: '', description: '', sort_order: '', is_active: true, parent_id: '' }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [imageFile, setImageFile] = useState(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await categoriesAPI.getAll(search ? { search } : {})
      setCategories(data.data || [])
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setImageFile(null); setModalOpen(true) }
  const openEdit = (item) => {
    setEditItem(item)
    setForm({ name: item.name || '', description: item.description || '', sort_order: item.sort_order ?? '', is_active: item.is_active ?? true, parent_id: item.parent_id || '' })
    setImageFile(null)
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) fd.append(k, v) })
      if (imageFile) fd.append('image', imageFile)
      if (editItem) {
        await categoriesAPI.update(editItem.id, fd)
        toast.success('Kategori berhasil diperbarui')
      } else {
        await categoriesAPI.create(fd)
        toast.success('Kategori berhasil ditambahkan')
      }
      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kategori')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await categoriesAPI.delete(id)
      toast.success('Kategori berhasil dihapus')
      setDeleteConfirm(null)
      fetchCategories()
    } catch {
      toast.error('Gagal menghapus kategori')
    }
  }

  const fc = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
  }

  const parentCategories = categories.filter((c) => !c.parent_id)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Kategori</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} kategori</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><Plus size={16} /> Tambah Kategori</button>
      </div>

      <div className="card p-4 mb-5">
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Cari kategori..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-9" />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Nama</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Parent</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Urutan</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? [...Array(5)].map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32" /></td>
                <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                <td className="px-4 py-3 hidden sm:table-cell text-center"><div className="h-4 bg-gray-200 rounded w-8 mx-auto" /></td>
                <td className="px-4 py-3 text-center"><div className="h-6 bg-gray-200 rounded-full w-14 mx-auto" /></td>
                <td className="px-4 py-3 text-center"><div className="h-8 bg-gray-200 rounded w-16 mx-auto" /></td>
              </tr>
            )) : categories.length > 0 ? categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {c.image ? (
                      <img src={getImageUrl(c.image)} alt={c.name} className="w-8 h-8 rounded-lg object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center"><Tag size={14} className="text-primary-500" /></div>
                    )}
                    <span className="font-semibold text-gray-900">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{c.parent?.name || (c.parent_id ? 'Ada parent' : 'Utama')}</td>
                <td className="px-4 py-3 hidden sm:table-cell text-center text-gray-500">{c.sort_order ?? '-'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={c.is_active ? 'badge-active' : 'badge-inactive'}>{c.is_active ? 'Aktif' : 'Nonaktif'}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 size={15} /></button>
                    <button onClick={() => setDeleteConfirm(c)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} className="px-4 py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                    <Tag size={32} className="text-gray-300" />
                  </div>
                  {search ? (
                    <>
                      <p className="font-semibold text-gray-700">Kategori tidak ditemukan</p>
                      <p className="text-sm text-gray-400">Tidak ada kategori yang cocok dengan <span className="font-medium text-gray-500">"{search}"</span></p>
                      <button onClick={() => setSearch('')} className="mt-2 btn-secondary text-xs py-1.5 px-4">Hapus Pencarian</button>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-700">Belum ada kategori</p>
                      <p className="text-sm text-gray-400">Tambahkan kategori pertama Anda</p>
                    </>
                  )}
                </div>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editItem ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Kategori *</label>
                <input value={form.name} onChange={fc('name')} className="input" placeholder="Nama kategori" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={fc('description')} className="input resize-none" rows={2} placeholder="Deskripsi singkat..." />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Parent Kategori</label>
                <select value={form.parent_id} onChange={fc('parent_id')} className="input">
                  <option value="">-- Kategori Utama --</option>
                  {parentCategories.filter((c) => !editItem || c.id !== editItem.id).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Urutan Tampil</label>
                <input type="number" value={form.sort_order} onChange={fc('sort_order')} className="input" placeholder="1" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Gambar</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0] || null)} className="input text-sm" />
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Kategori?</h3>
            <p className="text-sm text-gray-500 mb-5">Kategori <strong>{deleteConfirm.name}</strong> akan dihapus permanen.</p>
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
