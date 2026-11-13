import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Pagination, btnPrimary, btnSecondary, inputCls } from '../../Components/ui';

export default function UserList({ users, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const submit = (e) => {
        e.preventDefault();
        router.get('/admin/users', { search: search || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Kelola Pengguna">
            <div className="mx-auto max-w-5xl">
                <h1 className="font-serif text-3xl font-bold text-teal-900">Kelola pengguna</h1>
                <form role="search" onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                        <label htmlFor="user-search" className="sr-only">Cari pengguna</label>
                        <input id="user-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama, username, atau email" className={inputCls} />
                    </div>
                    <button type="submit" className={btnPrimary}>Cari pengguna</button>
                </form>
                <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-300 bg-white">
                    <table className="w-full min-w-[40rem] text-left text-sm">
                        <caption className="sr-only">Daftar pengguna terdaftar</caption>
                        <thead className="bg-stone-100 text-slate-800">
                            <tr>
                                <th scope="col" className="px-4 py-3 font-semibold">Nama</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Username</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Peran</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Artikel</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 text-slate-800">
                            {users.data.map((u) => (
                                <tr key={u.id}>
                                    <td className="px-4 py-3"><span className="font-semibold">{u.name}</span><br /><span className="text-slate-700">{u.email}</span></td>
                                    <td className="px-4 py-3">{u.username}</td>
                                    <td className="px-4 py-3">{u.role === 'admin' ? 'Admin' : 'Penulis'}</td>
                                    <td className="px-4 py-3">{u.posts_count}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Link href={`/admin/users/${u.id}/posts`} className={btnSecondary}>Lihat artikel</Link>
                                            <a href={`/admin/users/${u.id}/posts/export`} className={btnSecondary}>Ekspor Excel</a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination paginator={users} />
            </div>
        </AppLayout>
    );
}
