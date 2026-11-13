import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PublicLayout } from '../../Layouts/AppLayout';
import { Pagination, btnPrimary, btnSecondary, formatDate, inputCls } from '../../Components/ui';

function ArticleCard({ post }) {
    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-stone-300 bg-white">
            {post.cover_url ? (
                <img src={post.cover_url} alt={`Sampul artikel ${post.title}`} width="640" height="360" loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
            ) : (
                <div className="aspect-video w-full bg-gradient-to-br from-teal-800 to-teal-950" aria-hidden="true" />
            )}
            <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="w-fit rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-900">{post.category}</span>
                <h3 className="font-serif text-xl font-bold leading-snug text-slate-900">
                    <Link href={`/articles/${post.slug}`} className="hover:underline">{post.title}</Link>
                </h3>
                {post.excerpt && <p className="text-slate-700">{post.excerpt}</p>}
                <p className="mt-auto text-sm text-slate-700">
                    {post.user?.name} &middot; <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                </p>
            </div>
        </article>
    );
}

export default function PostIndex({ mode, posts, filters, categories }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const isHome = mode === 'home';

    const submit = (e) => {
        e.preventDefault();
        router.get('/articles', { search: search || undefined, category: filters.category || undefined }, { preserveState: true });
    };

    return (
        <PublicLayout title={isHome ? 'Beranda' : 'Daftar Artikel'}>
            {isHome && (
                <section className="mb-12 rounded-3xl bg-teal-900 px-6 py-12 text-white sm:px-12 sm:py-16" aria-labelledby="hero-heading">
                    <h1 id="hero-heading" className="max-w-2xl font-serif text-4xl font-bold leading-tight sm:text-5xl">Tulis apa yang Anda pahami, bagikan ke siapa saja.</h1>
                    <p className="mt-4 max-w-xl text-lg text-teal-50">
                        Blog komunitas untuk catatan teknologi, tutorial, bisnis, dan opini. Baca tanpa akun, atau daftar untuk mulai menerbitkan tulisan Anda sendiri.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        {auth.user ? (
                            <Link href={auth.user.role === 'admin' ? '/admin/users' : '/dashboard/posts'} className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-2 font-semibold text-teal-900 hover:bg-teal-50">Buka dashboard</Link>
                        ) : (
                            <>
                                <Link href="/login" className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-2 font-semibold text-teal-900 hover:bg-teal-50">Masuk</Link>
                                <Link href="/register" className="inline-flex min-h-11 items-center rounded-lg border-2 border-white px-5 py-2 font-semibold text-white hover:bg-teal-800">Daftar Penulis</Link>
                            </>
                        )}
                    </div>
                </section>
            )}

            {!isHome && <h1 className="font-serif text-4xl font-bold text-teal-900">Semua artikel</h1>}

            <section aria-label="Cari dan saring artikel" className={isHome ? '' : 'mt-6'}>
                <form role="search" onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                        <label htmlFor="search" className="sr-only">Cari artikel berdasarkan judul atau isi</label>
                        <input id="search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul atau isi artikel" className={inputCls} />
                    </div>
                    <button type="submit" className={btnPrimary}>Cari artikel</button>
                </form>
                <nav aria-label="Kategori artikel" className="mt-4">
                    <ul className="flex flex-wrap gap-2">
                        <li>
                            <Link href="/articles" aria-current={!filters.category ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${!filters.category ? 'border-teal-800 bg-teal-800 text-white' : 'border-slate-400 bg-white text-slate-800 hover:bg-slate-100'}`}>Semua</Link>
                        </li>
                        {categories.map((c) => (
                            <li key={c.value}>
                                <Link href={`/articles?category=${encodeURIComponent(c.value)}`} aria-current={filters.category === c.value ? 'page' : undefined} className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold ${filters.category === c.value ? 'border-teal-800 bg-teal-800 text-white' : 'border-slate-400 bg-white text-slate-800 hover:bg-slate-100'}`}>{c.value}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </section>

            <section className="mt-8" aria-labelledby="list-heading">
                <h2 id="list-heading" className="mb-4 font-serif text-2xl font-bold text-slate-900">{isHome ? 'Artikel terbaru' : 'Hasil'}</h2>
                {posts.data.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-slate-400 bg-white p-8 text-center text-slate-700">Belum ada artikel yang cocok. Coba kata kunci atau kategori lain.</p>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.data.map((post) => <ArticleCard key={post.id} post={post} />)}
                    </div>
                )}
                {isHome ? (
                    <div className="mt-8 text-center">
                        <Link href="/articles" className={btnSecondary}>Lihat semua artikel</Link>
                    </div>
                ) : (
                    <Pagination paginator={posts} />
                )}
            </section>
        </PublicLayout>
    );
}
