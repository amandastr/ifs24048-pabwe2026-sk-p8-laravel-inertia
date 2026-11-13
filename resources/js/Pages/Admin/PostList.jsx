import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Pagination, btnPrimary, btnSecondary, formatDate, inputCls } from '../../Components/ui';
import { IconDownload } from '../../Components/Icons';

export default function PostList({ posts, filters }) {
    const [search, setSearch] = useState(filters.search ?? '');
    const submit = (e) => {
        e.preventDefault();
        router.get('/admin/posts', { search: search || undefined }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Semua Artikel">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-serif text-3xl font-bold text-teal-900">Semua artikel</h1>
                    <a href="/admin/posts/export" className={btnSecondary}><IconDownload className="h-4 w-4" />Ekspor semua ke Excel</a>
                </div>
                <form role="search" onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                        <label htmlFor="admin-search" className="sr-only">Cari artikel</label>
                        <input id="admin-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul atau isi artikel" className={inputCls} />
                    </div>
                    <button type="submit" className={btnPrimary}>Cari artikel</button>
                </form>
                <div className="mt-6 overflow-x-auto rounded-2xl border border-stone-300 bg-white">
                    <table className="w-full min-w-[40rem] text-left text-sm">
                        <caption className="sr-only">Daftar seluruh artikel (hanya baca)</caption>
                        <thead className="bg-stone-100 text-slate-800">
                            <tr>
                                <th scope="col" className="px-4 py-3 font-semibold">Judul</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Penulis</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Kategori</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                                <th scope="col" className="px-4 py-3 font-semibold">Dibuat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200 text-slate-800">
                            {posts.data.map((p) => (
                                <tr key={p.id}>
                                    <td className="px-4 py-3 font-semibold">{p.is_published ? <Link href={`/articles/${p.slug}`} className="underline underline-offset-4">{p.title}</Link> : p.title}</td>
                                    <td className="px-4 py-3">{p.user?.name}</td>
                                    <td className="px-4 py-3">{p.category}</td>
                                    <td className="px-4 py-3">{p.is_published ? 'Dipublikasikan' : 'Draf'}</td>
                                    <td className="px-4 py-3">{formatDate(p.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination paginator={posts} />
            </div>
        </AppLayout>
    );
}
