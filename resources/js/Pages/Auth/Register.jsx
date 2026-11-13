import { Link, useForm } from '@inertiajs/react';
import { PublicLayout } from '../../Layouts/AppLayout';
import { FieldError, SubmitButton, inputCls } from '../../Components/ui';

const fields = [
    { name: 'name', label: 'Nama lengkap', type: 'text', auto: 'name' },
    { name: 'username', label: 'Username', type: 'text', auto: 'username' },
    { name: 'email', label: 'Email', type: 'email', auto: 'email' },
    { name: 'password', label: 'Kata sandi (minimal 8 karakter)', type: 'password', auto: 'new-password' },
    { name: 'password_confirmation', label: 'Ulangi kata sandi', type: 'password', auto: 'new-password' },
];

export default function Register() {
    const form = useForm({ name: '', username: '', email: '', password: '', password_confirmation: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post('/register', { onFinish: () => form.reset('password', 'password_confirmation') });
    };

    return (
        <PublicLayout title="Daftar Penulis">
            <section className="mx-auto max-w-md rounded-2xl border border-stone-300 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="register-heading">
                <h1 id="register-heading" className="font-serif text-3xl font-bold text-teal-900">Daftar sebagai penulis</h1>
                <p className="mt-2 text-slate-700">Buat akun gratis untuk menulis dan menerbitkan artikel Anda.</p>

                <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                    {fields.map((f) => (
                        <div key={f.name}>
                            <label htmlFor={`register-${f.name}`} className="mb-1 block text-sm font-semibold text-slate-800">{f.label}</label>
                            <input id={`register-${f.name}`} name={f.name} type={f.type} autoComplete={f.auto} required value={form.data[f.name]} onChange={(e) => form.setData(f.name, e.target.value)} aria-invalid={Boolean(form.errors[f.name])} aria-describedby={form.errors[f.name] ? `register-${f.name}-error` : undefined} className={inputCls} />
                            <FieldError id={`register-${f.name}-error`} message={form.errors[f.name]} />
                        </div>
                    ))}
                    <SubmitButton loading={form.processing} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-teal-800 px-4 py-2 font-semibold text-white hover:bg-teal-900 disabled:opacity-70">
                        Buat akun
                    </SubmitButton>
                </form>

                <p className="mt-6 text-sm text-slate-700">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-semibold text-teal-900 underline underline-offset-4">Masuk di sini</Link>
                </p>
            </section>
        </PublicLayout>
    );
}
