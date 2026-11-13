import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { IconClose, IconDots } from './Icons';

const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800';
export const btnPrimary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-70 ${focus}`;
export const btnSecondary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-400 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 ${focus}`;
export const btnDanger = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-70 ${focus}`;
export const inputCls = `block min-h-11 w-full rounded-lg border border-slate-400 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-600 ${focus}`;
export const menuItemCls = `flex min-h-11 w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-slate-100 ${focus}`;

export function Spinner() {
    return (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
    );
}

export function SubmitButton({ loading = false, children, className = btnPrimary, ...props }) {
    return (
        <button type="submit" disabled={loading} className={className} {...props}>
            {loading && <Spinner />}
            {children}
        </button>
    );
}

export function LoadingIndicator() {
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        const offStart = router.on('start', () => setBusy(true));
        const offFinish = router.on('finish', () => setBusy(false));
        return () => {
            offStart();
            offFinish();
        };
    }, []);

    if (!busy) return null;

    return (
        <>
            <div className="fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-teal-100" role="presentation">
                <div className="h-full w-1/3 animate-progress bg-teal-800" />
            </div>
            <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg">
                <Spinner />
                Memproses tindakan...
            </div>
        </>
    );
}

export function Flash() {
    const { flash } = usePage().props;
    if (!flash?.success && !flash?.error) return null;

    return (
        <div role="status" className={`mb-4 rounded-lg border px-4 py-3 text-sm font-medium ${flash.error ? 'border-red-300 bg-red-50 text-red-900' : 'border-emerald-300 bg-emerald-50 text-emerald-900'}`}>
            {flash.error || flash.success}
        </div>
    );
}

export function FieldError({ id, message }) {
    if (!message) return null;
    return (
        <p id={id} role="alert" className="mt-1 text-sm font-medium text-red-700">
            {message}
        </p>
    );
}

export function Pagination({ paginator }) {
    if (!paginator || paginator.last_page <= 1) return null;

    return (
        <nav aria-label="Navigasi halaman" className="mt-8 flex items-center justify-between gap-4">
            {paginator.prev_page_url ? (
                <Link href={paginator.prev_page_url} preserveScroll className={btnSecondary}>Sebelumnya</Link>
            ) : (
                <span className="w-28" aria-hidden="true" />
            )}
            <span className="text-sm text-slate-700">Halaman {paginator.current_page} dari {paginator.last_page}</span>
            {paginator.next_page_url ? (
                <Link href={paginator.next_page_url} preserveScroll className={btnSecondary}>Berikutnya</Link>
            ) : (
                <span className="w-28" aria-hidden="true" />
            )}
        </nav>
    );
}

export function FullScreenModal({ title, onClose, children, footer, labelId = 'modal-title' }) {
    useEffect(() => {
        const onKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    return (
        <div role="dialog" aria-modal="true" aria-labelledby={labelId} className="fixed inset-0 z-50 flex flex-col bg-white">
            <header className="flex items-center justify-between bg-teal-900 px-4 py-3 text-white sm:px-6">
                <h2 id={labelId} className="font-serif text-xl font-bold">{title}</h2>
                <button type="button" onClick={onClose} aria-label="Tutup jendela" className="inline-flex h-11 w-11 items-center justify-center rounded-lg hover:bg-teal-800 focus-visible:outline-white">
                    <IconClose />
                </button>
            </header>
            <div className="flex-1 overflow-y-auto bg-white p-4 sm:p-6">{children}</div>
            <footer className="flex flex-wrap justify-end gap-3 border-t border-slate-300 bg-slate-100 px-4 py-3 sm:px-6">{footer}</footer>
        </div>
    );
}

export function KebabMenu({ label, children }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return undefined;
        const onDown = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('mousedown', onDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    return (
        <div ref={ref} className="relative">
            <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => setOpen((o) => !o)} className={`inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-200 ${focus}`}>
                <IconDots />
            </button>
            {open && (
                <div role="menu" aria-label={label} onClick={() => setOpen(false)} className="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-300 bg-white py-1 shadow-lg">
                    {children}
                </div>
            )}
        </div>
    );
}

export function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}
