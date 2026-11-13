import { Link, router, usePage } from '@inertiajs/react';
import { lazy, Suspense, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { FieldError, Spinner, btnDanger, btnPrimary, btnSecondary, formatDate } from '../../Components/ui';

const MarkdownViewer = lazy(() => import('../../Components/MarkdownViewer'));

export default function Show({ post }) {
    const { errors } = usePage().props;
    const [busy, setBusy] = useState(false);
    const visit = { preserveScroll: true, onStart: () => setBusy(true), onFinish: () => setBusy(false) };

    const upload = (e) => {
        const input = e.target;
        const cover = input.files[0];
        if (!cover) return;
        router.post(`/dashboard/posts/${post.id}/cover`, { cover }, { ...visit, forceFormData: true, onFinish: () => { setBusy(false); input.value = ''; } });
    };

    return (
        <AppLayout title={post.title}>
            <article className="mx-auto max-w-3xl">
                <Link href="/dashboard/posts" className="inline-flex min-h-11 items-center text-sm font-semibold text-teal-900 underline underline-offset-4">Kembali ke daftar artikel</Link>
                <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-slate-900">{post.title}</h1>
                <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                    <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-900">{post.category}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${post.is_published ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>{post.is_published ? 'Dipublikasikan' : 'Draf'}</span>
                    <time dateTime={post.created_at}>Dibuat {formatDate(post.created_at)}</time>
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" disabled={busy} onClick={() => router.patch(`/dashboard/posts/${post.id}/publish`, {}, visit)} className={btnPrimary}>
                        {busy && <Spinner />}{post.is_published ? 'Jadikan Draf' : 'Publikasikan'}
                    </button>
                    {post.is_published && <Link href={`/articles/${post.slug}`} className={btnSecondary}>Lihat di halaman publik</Link>}
                    <label htmlFor="cover-upload" className={btnSecondary}>
                        {post.cover_url ? 'Ganti foto sampul' : 'Unggah foto sampul'}
                        <input id="cover-upload" type="file" accept="image/*" onChange={upload} className="sr-only" />
                    </label>
                    {post.cover_url && (
                        <button type="button" disabled={busy} onClick={() => router.delete(`/dashboard/posts/${post.id}/cover`, visit)} className={btnDanger}>Hapus foto sampul</button>
                    )}
                </div>
                <FieldError message={errors?.cover} />

                {post.cover_url && <img src={post.cover_url} alt={`Sampul artikel ${post.title}`} width="960" height="540" decoding="async" className="mt-6 aspect-video w-full rounded-2xl object-cover" />}
                {post.excerpt && <p className="mt-6 text-lg italic text-slate-700">{post.excerpt}</p>}
                <div className="mt-6 rounded-2xl bg-white p-4 sm:p-8">
                    <Suspense fallback={<p className="text-slate-700">Memuat isi artikel...</p>}>
                        <MarkdownViewer content={post.content} />
                    </Suspense>
                </div>
            </article>
        </AppLayout>
    );
}
