import { Head, Link, usePage } from '@inertiajs/react';
import { Flash, LoadingIndicator } from '../Components/ui';
import { IconLogin, IconUserPlus } from '../Components/Icons';

const linkBase = 'inline-flex min-h-11 items-center rounded-lg px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800';

function NavLink({ href, children, active, className = '' }) {
    return (
        <Link href={href} aria-current={active ? 'page' : undefined} className={`${linkBase} ${active ? 'bg-teal-800 text-white' : 'text-slate-800 hover:bg-stone-200'} ${className}`}>
            {children}
        </Link>
    );
}

function SkipLink() {
    return (
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[110] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:font-semibold focus:text-teal-900">
            Lewati ke konten utama
        </a>
    );
}

/** Layout publik: Sticky Top Navbar, tanpa sidebar, footer editorial. */
export function PublicLayout({ title, children }) {
    const { auth, appName } = usePage().props;
    const { url } = usePage();
    const path = url.split('?')[0];
    const panel = auth.user?.role === 'admin' ? { href: '/admin/users', label: 'Panel Admin' } : { href: '/dashboard/posts', label: 'Dashboard Penulis' };

    return (
        <div className="flex min-h-screen flex-col">
            <Head title={title} />
            <SkipLink />
            <LoadingIndicator />
            <header className="sticky top-0 z-40 border-b border-stone-300 bg-white/95 backdrop-blur">
                <nav aria-label="Navigasi utama" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2">
                    <Link href="/" className="font-serif text-2xl font-bold text-teal-900 focus-visible:outline-2 focus-visible:outline-teal-800">
                        {appName}
                    </Link>
                    <div className="flex flex-wrap items-center gap-1">
                        <NavLink href="/" active={path === '/'}>Beranda</NavLink>
                        <NavLink href="/articles" active={path.startsWith('/articles')}>Artikel</NavLink>
                        {auth.user ? (
                            <>
                                <NavLink href={panel.href}>{panel.label}</NavLink>
                                <span className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-800 text-sm font-bold text-white" title={auth.user.name}>
                                    <span aria-hidden="true">{auth.user.name.charAt(0).toUpperCase()}</span>
                                    <span className="sr-only">Masuk sebagai {auth.user.name}</span>
                                </span>
                            </>
                        ) : (
                            <>
                                <NavLink href="/login" active={path === '/login'}><IconLogin className="mr-1.5 h-4 w-4" />Masuk</NavLink>
                                <Link href="/register" className={`${linkBase} bg-teal-800 text-white hover:bg-teal-900`}><IconUserPlus className="mr-1.5 h-4 w-4" />Daftar</Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
                <Flash />
                {children}
            </main>

            <footer className="border-t border-stone-300 bg-stone-100">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-serif text-lg font-bold text-teal-900">{appName}</p>
                    <nav aria-label="Navigasi footer">
                        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-800">
                            <li><Link href="/" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Beranda Publik</Link></li>
                            <li><Link href="/login" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Halaman Login</Link></li>
                            <li><Link href="/register" className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">Halaman Register</Link></li>
                        </ul>
                    </nav>
                </div>
            </footer>
        </div>
    );
}

/** Layout terautentikasi (Penulis & Admin) dengan sidebar. */
export default function AppLayout({ title, children }) {
    const { auth, appName } = usePage().props;
    const { url } = usePage();
    const path = url.split('?')[0];
    const isAdmin = auth.user.role === 'admin';

    const items = isAdmin
        ? [
              { href: '/admin/users', label: 'Kelola Pengguna', active: path.startsWith('/admin/users') },
              { href: '/admin/posts', label: 'Semua Artikel', active: path.startsWith('/admin/posts') },
          ]
        : [{ href: '/dashboard/posts', label: 'Artikel Saya', active: path.startsWith('/dashboard/posts') }];
    items.push({ href: '/profile', label: 'Profil', active: path === '/profile' });

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            <Head title={title} />
            <SkipLink />
            <LoadingIndicator />
            <aside className="border-b border-stone-300 bg-white md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:border-b-0 md:border-r">
                <div className="flex flex-col gap-3 p-4">
                    <Link href="/" className="font-serif text-2xl font-bold text-teal-900">{appName}</Link>
                    <p className="text-sm text-slate-700">
                        {auth.user.name}
                        <span className="block text-xs">{isAdmin ? 'Administrator' : 'Penulis'}</span>
                    </p>
                    <nav aria-label="Navigasi dashboard">
                        <ul className="flex flex-wrap gap-1 md:flex-col">
                            {items.map((item) => (
                                <li key={item.href}><NavLink href={item.href} active={item.active} className="w-full">{item.label}</NavLink></li>
                            ))}
                            <li><NavLink href="/articles" className="w-full">Lihat Blog Publik</NavLink></li>
                            <li>
                                <Link href="/logout" method="post" as="button" className={`${linkBase} w-full text-left text-red-700 hover:bg-red-50`}>Keluar</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            </aside>
            <main id="main" className="min-w-0 flex-1 bg-stone-50 p-4 sm:p-8">
                <Flash />
                {children}
            </main>
        </div>
    );
}
