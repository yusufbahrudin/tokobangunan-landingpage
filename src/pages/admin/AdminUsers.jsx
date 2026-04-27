import { useState, useEffect, useCallback } from 'react'
import { adminUsersAPI } from '../../lib/api'
import {
  Search, Users, Edit2, Trash2, X, Loader2,
  ToggleLeft, ToggleRight, Shield,
} from 'lucide-react'
import { formatDate } from '../../lib/utils'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [role, setRole] = useState('')
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', role: 'user', is_active: true })
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      if (role) params.role = role
      const { data } = await adminUsersAPI.getAll(params)
      setUsers(data.data?.users || data.data || [])
      setMeta(data.meta || { total: 0, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }, [page, search, role])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const openEdit = (user) => {
    setEditItem(user)
    setForm({ name: user.name || '', phone: user.phone || '', role: user.role || 'user', is_active: user.is_active ?? true })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await adminUsersAPI.update(editItem.id, form)
      toast.success('Pengguna berhasil diperbarui')
      setEditItem(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui pengguna')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (user) => {
    try {
      await adminUsersAPI.toggleActive(user.id)
      toast.success(`Pengguna ${user.is_active ? 'dinonaktifkan' : 'diaktifkan'}`)
      fetchUsers()
    } catch {
      toast.error('Gagal mengubah status pengguna')
    }
  }

  const handleDelete = async (id) => {
    try {
      await adminUsersAPI.delete(id)
      toast.success('Pengguna berhasil dihapus')
      setDeleteConfirm(null)
      fetchUsers()
    } catch {
      toast.error('Gagal menghapus pengguna')
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
          <h1 className="text-2xl font-extrabold text-gray-900">Pengguna</h1>
          <p className="text-sm text-gray-500 mt-0.5">{meta.total} total pengguna</p>
        </div>
      </div>

      <div className="card p-4 mb-5">
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari nama atau email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="input pl-9" />
          </div>
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1) }} className="input w-auto">
            <option value="">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Pengguna</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Telepon</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Role</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Terdaftar</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-gray-200" /><div className="space-y-1"><div className="h-4 bg-gray-200 rounded w-28" /><div className="h-3 bg-gray-200 rounded w-36" /></div></div></td>
                  <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-4 py-3 text-center"><div className="h-6 bg-gray-200 rounded-full w-14 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><div className="h-6 bg-gray-200 rounded-full w-14 mx-auto" /></td>
                  <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-24" /></td>
                  <td className="px-4 py-3 text-center"><div className="h-8 bg-gray-200 rounded w-20 mx-auto" /></td>
                </tr>
              )) : users.length > 0 ? users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${u.role === 'admin' ? 'bg-primary-600' : 'bg-gray-400'}`}>
                        {u.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-500">{u.phone || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' && <Shield size={10} />}{u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggle(u)} className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold transition-colors ${u.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
                      {u.is_active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteConfirm(u)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-1">
                      <Users size={32} className="text-gray-300" />
                    </div>
                    {search || role ? (
                      <>
                        <p className="font-semibold text-gray-700">Pengguna tidak ditemukan</p>
                        <p className="text-sm text-gray-400">
                          {search ? <>Tidak ada pengguna yang cocok dengan <span className="font-medium text-gray-500">"{search}"</span></> : 'Tidak ada pengguna dengan filter yang dipilih'}
                        </p>
                        <button onClick={() => { setSearch(''); setRole(''); setPage(1) }} className="mt-2 btn-secondary text-xs py-1.5 px-4">Hapus Filter</button>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-gray-700">Belum ada pengguna</p>
                        <p className="text-sm text-gray-400">Pengguna yang mendaftar akan muncul di sini</p>
                      </>
                    )}
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
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

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Edit Pengguna</h2>
              <button onClick={() => setEditItem(null)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama</label>
                <input value={form.name} onChange={fc('name')} className="input" placeholder="Nama pengguna" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telepon</label>
                <input value={form.phone} onChange={fc('phone')} className="input" placeholder="08xxxxxxxxxx" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select value={form.role} onChange={fc('role')} className="input">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={fc('is_active')} className="w-4 h-4 accent-primary-600" />
                <span className="text-sm font-medium text-gray-700">Aktif</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditItem(null)} className="btn-secondary flex-1 justify-center">Batal</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : 'Perbarui'}
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">Hapus Pengguna?</h3>
            <p className="text-sm text-gray-500 mb-5">Pengguna <strong>{deleteConfirm.name}</strong> akan dihapus permanen.</p>
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
