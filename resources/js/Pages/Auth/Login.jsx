import { Link, useForm } from '@inertiajs/react';
import { PublicLayout } from '../../Layouts/AppLayout';
import { FieldError, SubmitButton, inputCls } from '../../Components/ui';

export default function Login() {
    const form = useForm({ username: '', password: '', remember: false });

    const submit = (e) => {
        e.preventDefault();
        form.post('/login', { onFinish: () => form.reset('password') });
    };

    return (
        <PublicLayout title="Masuk">
            <section className="mx-auto max-w-md rounded-2xl border border-stone-300 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="login-heading">
                <h1 id="login-heading" className="font-serif text-3xl font-bold text-teal-900">Masuk ke akun Anda</h1>
                <p className="mt-2 text-slate-700">Kelola artikel Anda atau pantau seluruh blog sebagai admin.</p>

                <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                    <div>
                        <label htmlFor="login-username" className="mb-1 block text-sm font-semibold text-slate-800">Username atau email</label>
                        <input id="login-username" name="username" type="text" autoComplete="username" required value={form.data.username} onChange={(e) => form.setData('username', e.target.value)} aria-invalid={Boolean(form.errors.username)} aria-describedby={form.errors.username ? 'login-username-error' : undefined} className={inputCls} />
                        <FieldError id="login-username-error" message={form.errors.username} />
                    </div>
                    <div>
                        <label htmlFor="login-password" className="mb-1 block text-sm font-semibold text-slate-800">Kata sandi</label>
                        <input id="login-password" name="password" type="password" autoComplete="current-password" required value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} aria-invalid={Boolean(form.errors.password)} aria-describedby={form.errors.password ? 'login-password-error' : undefined} className={inputCls} />
                        <FieldError id="login-password-error" message={form.errors.password} />
                    </div>
                    <label htmlFor="login-remember" className="flex min-h-11 items-center gap-2 text-sm text-slate-800">
                        <input id="login-remember" type="checkbox" checked={form.data.remember} onChange={(e) => form.setData('remember', e.target.checked)} className="h-5 w-5 accent-teal-800" />
                        Ingat saya di perangkat ini
                    </label>
                    <SubmitButton id="login-submit" loading={form.processing} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2 font-semibold text-white hover:bg-teal-900 disabled:opacity-70">
                        Masuk
                    </SubmitButton>
                </form>

                <p className="mt-6 text-sm text-slate-700">
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-semibold text-teal-900 underline underline-offset-4">Daftar sebagai penulis</Link>
                </p>
            </section>
        </PublicLayout>
    );
}
