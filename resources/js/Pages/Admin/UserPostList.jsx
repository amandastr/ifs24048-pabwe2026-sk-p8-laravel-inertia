import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Pagination, btnPrimary, btnSecondary, formatDate, inputCls } from '../../Components/ui';
import { IconDownload } from '../../Components/Icons';

export default function UserPostList({ owner, posts, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const submit = (e) => {
        e.preventDefault();
        router.get(`/admin/users/${owner.id}/posts`, { search: search || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title={`Artikel ${owner.name}`}>
            <div className="mx-auto max-w-5xl">
                <Link href="/admin/users" className="inline-flex min-h-11 items-center text-sm font-semibold text-teal-900 underline underline-offset-4">Kembali ke daftar pengguna</Link>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-serif text-3xl font-bold text-teal-900">Artikel {owner.name}</h1>
                    <a href={`/admin/users/${owner.id}/posts/export`} className={btnSecondary}><IconDownload className="h-4 w-4" />Ekspor ke Excel</a>
                </div>
                <p className="mt-1 text-slate-700">Tampilan hanya baca. Admin tidak dapat mengubah artikel pengguna.</p>
                <form role="search" onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                        <label htmlFor="up-search" className="sr-only">Cari artikel pengguna</label>
                        <input id="up-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul atau isi artikel" className={inputCls} />
                    </div>
                    <button type="submit" className={btnPrimary}>Cari artikel</button>
                </form>
                <ul className="mt-6 divide-y divide-stone-200 rounded-2xl border border-stone-300 bg-white">
                    {posts.data.length === 0 && <li className="p-6 text-center text-slate-700">Pengguna ini belum memiliki artikel.</li>}
                    {posts.data.map((p) => (
                        <li key={p.id} className="p-4">
                            <p className="font-semibold text-slate-900">{p.title}</p>
                            <p className="mt-1 text-sm text-slate-700">{p.category} &middot; {p.is_published ? 'Dipublikasikan' : 'Draf'} &middot; {formatDate(p.created_at)}</p>
                        </li>
                    ))}
                </ul>
                <Pagination paginator={posts} />
            </div>
        </AppLayout>
    );
}
