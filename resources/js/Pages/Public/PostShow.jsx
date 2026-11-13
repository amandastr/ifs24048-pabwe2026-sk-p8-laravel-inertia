import { Link, usePage } from '@inertiajs/react';
import { lazy, Suspense } from 'react';
import { PublicLayout } from '../../Layouts/AppLayout';
import { formatDate } from '../../Components/ui';

const MarkdownViewer = lazy(() => import('../../Components/MarkdownViewer'));

export default function PostShow({ post }) {
    const { auth } = usePage().props;

    return (
        <PublicLayout title={post.title}>
            <article className="mx-auto max-w-3xl">
                <Link href="/articles" className="inline-flex min-h-11 items-center text-sm font-semibold text-teal-900 underline underline-offset-4">Kembali ke daftar artikel</Link>
                <header className="mt-4">
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-900">{post.category}</span>
                    <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-slate-900">{post.title}</h1>
                    <p className="mt-3 text-slate-700">
                        Oleh {post.user?.name} &middot; <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                    </p>
                </header>
                {post.cover_url && (
                    <img src={post.cover_url} alt={`Sampul artikel ${post.title}`} width="960" height="540" decoding="async" className="mt-6 aspect-video w-full rounded-2xl object-cover" />
                )}
                <div className="mt-8 rounded-2xl bg-white p-4 sm:p-8">
                    <Suspense fallback={<p className="text-slate-700">Memuat isi artikel...</p>}>
                        <MarkdownViewer content={post.content} />
                    </Suspense>
                </div>

                {!auth.user && (
                    <aside className="mt-10 rounded-2xl bg-teal-900 p-6 text-white sm:p-8" aria-labelledby="join-heading">
                        <h2 id="join-heading" className="font-serif text-2xl font-bold">Punya gagasan untuk dibagikan?</h2>
                        <p className="mt-2 text-teal-50">Masuk atau daftar untuk menulis dan menerbitkan artikel Anda sendiri di komunitas ini.</p>
                        <div className="mt-5 flex flex-wrap gap-3">
                            <Link href="/login" className="inline-flex min-h-11 items-center rounded-lg bg-white px-5 py-2 font-semibold text-teal-900 hover:bg-teal-50">Halaman Login</Link>
                            <Link href="/register" className="inline-flex min-h-11 items-center rounded-lg border-2 border-white px-5 py-2 font-semibold text-white hover:bg-teal-800">Halaman Register</Link>
                        </div>
                    </aside>
                )}
            </article>
        </PublicLayout>
    );
}
