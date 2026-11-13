import { Link, router, useForm, usePage } from '@inertiajs/react';
import { lazy, Suspense, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { FieldError, FullScreenModal, KebabMenu, Pagination, Spinner, SubmitButton, btnDanger, btnPrimary, btnSecondary, formatDate, inputCls, menuItemCls } from '../../Components/ui';
import { IconDownload, IconEye, IconPencil, IconPlus, IconSpark, IconTrash, IconUpload } from '../../Components/Icons';

const MarkdownEditor = lazy(() => import('../../Components/MarkdownEditor'));

function StatCard({ label, value }) {
    return (
        <div className="rounded-2xl border border-stone-300 bg-white p-5">
            <p className="text-sm font-semibold text-slate-700">{label}</p>
            <p className="mt-1 font-serif text-4xl font-bold text-teal-900">{value}</p>
        </div>
    );
}

function PostFormModal({ post, categories, onClose }) {
    const editing = Boolean(post);
    const form = useForm({
        title: post?.title ?? '',
        category: post?.category ?? 'Umum',
        excerpt: post?.excerpt ?? '',
        content: post?.content ?? '',
        is_published: post?.is_published ?? false,
        cover: null,
    });

    const submit = (e) => {
        e.preventDefault();
        const options = { forceFormData: true, preserveScroll: true, onSuccess: onClose };
        if (editing) {
            form.transform((data) => ({ ...data, _method: 'put' })).post(`/dashboard/posts/${post.id}`, options);
        } else {
            form.post('/dashboard/posts', options);
        }
    };

    return (
        <FullScreenModal
            title={editing ? 'Ubah artikel' : 'Tambah artikel'}
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className={btnSecondary}>Batal</button>
                    <SubmitButton form="post-form" loading={form.processing}>{editing ? 'Simpan perubahan' : 'Simpan artikel'}</SubmitButton>
                </>
            }
        >
            <form id="post-form" onSubmit={submit} className="mx-auto max-w-4xl space-y-5" noValidate>
                <div>
                    <label htmlFor="post-title" className="mb-1 block text-sm font-semibold text-slate-800">Judul</label>
                    <input id="post-title" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} className={inputCls} required aria-invalid={Boolean(form.errors.title)} />
                    <FieldError message={form.errors.title} />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label htmlFor="post-category" className="mb-1 block text-sm font-semibold text-slate-800">Kategori</label>
                        <select id="post-category" value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} className={inputCls}>
                            {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                        <FieldError message={form.errors.category} />
                    </div>
                    <div>
                        <label htmlFor="post-cover" className="mb-1 block text-sm font-semibold text-slate-800">Foto sampul (maks. 2 MB)</label>
                        <input id="post-cover" type="file" accept="image/*" onChange={(e) => form.setData('cover', e.target.files[0] ?? null)} className={inputCls} />
                        <FieldError message={form.errors.cover} />
                    </div>
                </div>
                <div>
                    <label htmlFor="post-excerpt" className="mb-1 block text-sm font-semibold text-slate-800">Ringkasan (1-2 kalimat)</label>
                    <textarea id="post-excerpt" rows={2} value={form.data.excerpt} onChange={(e) => form.setData('excerpt', e.target.value)} className={inputCls} />
                    <FieldError message={form.errors.excerpt} />
                </div>
                <div>
                    <p className="mb-1 text-sm font-semibold text-slate-800">Isi artikel (Markdown)</p>
                    <Suspense fallback={<p className="text-slate-700">Memuat editor...</p>}>
                        <MarkdownEditor value={form.data.content} onChange={(v) => form.setData('content', v)} />
                    </Suspense>
                    <FieldError message={form.errors.content} />
                </div>
                <label htmlFor="post-published" className="flex min-h-11 items-center gap-3 text-sm font-semibold text-slate-800">
                    <input id="post-published" type="checkbox" checked={form.data.is_published} onChange={(e) => form.setData('is_published', e.target.checked)} className="h-5 w-5 accent-teal-800" />
                    Publikasikan sekarang
                </label>
            </form>
        </FullScreenModal>
    );
}

function AiModal({ categories, onClose }) {
    const { flash, errors } = usePage().props;
    const generated = flash?.generated;
    const [data, setData] = useState({ topic: '', count: 3, category: '' });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const generate = (e) => {
        e.preventDefault();
        router.post('/dashboard/posts/ai-generate', { ...data, category: data.category || null }, {
            preserveScroll: true,
            preserveState: true,
            onStart: () => setLoading(true),
            onFinish: () => setLoading(false),
        });
    };

    const save = () => router.post('/dashboard/posts/ai-save', { posts: generated }, {
        onStart: () => setSaving(true),
        onFinish: () => setSaving(false),
        onSuccess: onClose,
    });

    return (
        <FullScreenModal
            title="Buat artikel dengan AI"
            labelId="ai-title"
            onClose={onClose}
            footer={
                <>
                    <button type="button" onClick={onClose} className={btnSecondary}>Tutup</button>
                    {generated?.length > 0 && (
                        <button type="button" onClick={save} disabled={saving} className={btnPrimary}>
                            {saving && <Spinner />}Simpan {generated.length} artikel sebagai draf
                        </button>
                    )}
                </>
            }
        >
            <div className="mx-auto max-w-3xl">
                <form onSubmit={generate} className="space-y-5" noValidate>
                    <div>
                        <label htmlFor="ai-topic" className="mb-1 block text-sm font-semibold text-slate-800">Topik artikel</label>
                        <input id="ai-topic" value={data.topic} onChange={(e) => setData({ ...data, topic: e.target.value })} className={inputCls} required maxLength={200} />
                        <FieldError message={errors?.topic} />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label htmlFor="ai-count" className="mb-1 block text-sm font-semibold text-slate-800">Jumlah artikel (1-5)</label>
                            <input id="ai-count" type="number" min={1} max={5} step={1} value={data.count} onChange={(e) => setData({ ...data, count: Math.min(5, Math.max(1, Number(e.target.value) || 1)) })} className={inputCls} required />
                            <FieldError message={errors?.count} />
                        </div>
                        <div>
                            <label htmlFor="ai-category" className="mb-1 block text-sm font-semibold text-slate-800">Kategori (opsional)</label>
                            <select id="ai-category" value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })} className={inputCls}>
                                <option value="">Biarkan AI memilih</option>
                                {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                    </div>
                    <FieldError message={errors?.ai} />
                    <SubmitButton loading={loading}><IconSpark className="h-4 w-4" />Hasilkan artikel</SubmitButton>
                </form>

                {generated?.length > 0 && (
                    <section className="mt-8" aria-labelledby="ai-result">
                        <h3 id="ai-result" className="font-serif text-xl font-bold text-slate-900">Hasil dari AI</h3>
                        <ul className="mt-3 space-y-3">
                            {generated.map((item, i) => (
                                <li key={i} className="rounded-xl border border-stone-300 bg-stone-50 p-4">
                                    <p className="font-semibold text-slate-900">{item.title}</p>
                                    <p className="text-sm text-teal-900">{item.category}</p>
                                    <p className="mt-1 text-sm text-slate-700">{item.excerpt}</p>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </FullScreenModal>
    );
}

export default function Index({ posts, stats, filters, categories }) {
    const { flash, errors } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [aiOpen, setAiOpen] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [busyId, setBusyId] = useState(null);
    const [importing, setImporting] = useState(false);

    const openCreate = () => { setEditing(null); setFormOpen(true); };
    const openEdit = (post) => { setEditing(post); setFormOpen(true); };

    const submitSearch = (e) => {
        e.preventDefault();
        router.get('/dashboard/posts', { search: search || undefined }, { preserveState: true, replace: true });
    };

    const toggle = (post) => router.patch(`/dashboard/posts/${post.id}/publish`, {}, {
        preserveScroll: true,
        onStart: () => setBusyId(post.id),
        onFinish: () => setBusyId(null),
    });

    const confirmDelete = () => router.delete(`/dashboard/posts/${deleting.id}`, {
        preserveScroll: true,
        onStart: () => setBusyId(deleting.id),
        onFinish: () => { setBusyId(null); setDeleting(null); },
    });

    const importFile = (e) => {
        const input = e.target;
        const file = input.files[0];
        if (!file) return;
        router.post('/dashboard/posts/import', { file }, {
            forceFormData: true,
            onStart: () => setImporting(true),
            onFinish: () => { setImporting(false); input.value = ''; },
        });
    };

    return (
        <AppLayout title="Artikel Saya">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-serif text-3xl font-bold text-teal-900">Artikel saya</h1>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setAiOpen(true)} className={btnSecondary}><IconSpark className="h-4 w-4" />Buat dengan AI</button>
                        <a href="/dashboard/posts/export" className={btnSecondary}><IconDownload className="h-4 w-4" />Ekspor Excel</a>
                        <label htmlFor="import-file" className={`${btnSecondary} ${importing ? 'opacity-70' : ''}`}>
                            {importing ? <Spinner /> : <IconUpload className="h-4 w-4" />}Impor Excel
                            <input id="import-file" type="file" accept=".xlsx,.xls" onChange={importFile} className="sr-only" />
                        </label>
                        <button type="button" onClick={openCreate} className={btnPrimary}><IconPlus className="h-4 w-4" />Tambah artikel</button>
                    </div>
                </div>

                {(flash?.error || errors?.file) && <p role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-900">{errors?.file || flash.error}</p>}

                <section aria-label="Ringkasan statistik artikel" className="mt-6 grid gap-4 sm:grid-cols-3">
                    <StatCard label="Total Artikel" value={stats.total} />
                    <StatCard label="Total Selesai" value={stats.published} />
                    <StatCard label="Belum Selesai" value={stats.draft} />
                </section>

                <form role="search" onSubmit={submitSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <div className="flex-1">
                        <label htmlFor="dash-search" className="sr-only">Cari artikel saya</label>
                        <input id="dash-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari judul atau isi artikel saya" className={inputCls} />
                    </div>
                    <button type="submit" className={btnPrimary}>Cari artikel</button>
                </form>

                <section className="mt-6" aria-labelledby="list-heading">
                    <h2 id="list-heading" className="sr-only">Daftar artikel</h2>
                    {posts.data.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-400 bg-white p-8 text-center text-slate-700">Belum ada artikel. Pilih Tambah artikel untuk menulis yang pertama.</p>
                    ) : (
                        <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-300 bg-white">
                            {posts.data.map((post) => (
                                <li key={post.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                                    <div className="min-w-0 flex-1">
                                        <Link href={`/dashboard/posts/${post.id}`} className="block truncate font-semibold text-slate-900 hover:underline">{post.title}</Link>
                                        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-700">
                                            <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-900">{post.category}</span>
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${post.is_published ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'}`}>{post.is_published ? 'Dipublikasikan' : 'Draf'}</span>
                                            <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => toggle(post)} disabled={busyId === post.id} className={btnSecondary}>
                                            {busyId === post.id && <Spinner />}
                                            {post.is_published ? 'Jadikan Draf' : 'Publikasikan'}
                                        </button>
                                        <KebabMenu label={`Menu tindakan untuk ${post.title}`}>
                                            <Link href={`/dashboard/posts/${post.id}`} role="menuitem" className={`${menuItemCls} text-teal-900`}><IconEye className="h-4 w-4" />Detail</Link>
                                            <button type="button" role="menuitem" onClick={() => openEdit(post)} className={`${menuItemCls} text-teal-900`}><IconPencil className="h-4 w-4" />Ubah</button>
                                            <button type="button" role="menuitem" onClick={() => setDeleting(post)} className={`${menuItemCls} text-red-700`}><IconTrash className="h-4 w-4" />Hapus</button>
                                        </KebabMenu>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <Pagination paginator={posts} />
                </section>
            </div>

            {formOpen && <PostFormModal key={editing?.id ?? 'new'} post={editing} categories={categories} onClose={() => setFormOpen(false)} />}
            {aiOpen && <AiModal categories={categories} onClose={() => setAiOpen(false)} />}
            {deleting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                    <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" aria-describedby="del-desc" className="w-full max-w-md rounded-2xl bg-white p-6">
                        <h2 id="del-title" className="font-serif text-xl font-bold text-slate-900">Hapus artikel?</h2>
                        <p id="del-desc" className="mt-2 text-slate-700">Artikel &ldquo;{deleting.title}&rdquo; akan dihapus permanen beserta foto sampulnya.</p>
                        <div className="mt-6 flex justify-end gap-3">
                            <button type="button" onClick={() => setDeleting(null)} className={btnSecondary}>Batal</button>
                            <button type="button" onClick={confirmDelete} disabled={busyId === deleting.id} className={btnDanger}>
                                {busyId === deleting.id && <Spinner />}Hapus artikel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
