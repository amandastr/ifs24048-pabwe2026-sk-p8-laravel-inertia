import { useForm, usePage } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { FieldError, SubmitButton, inputCls } from '../../Components/ui';

const fields = [
    { name: 'name', label: 'Nama lengkap', type: 'text', auto: 'name' },
    { name: 'username', label: 'Username', type: 'text', auto: 'username' },
    { name: 'email', label: 'Email', type: 'email', auto: 'email' },
    { name: 'password', label: 'Kata sandi baru (kosongkan jika tidak diganti)', type: 'password', auto: 'new-password' },
    { name: 'password_confirmation', label: 'Ulangi kata sandi baru', type: 'password', auto: 'new-password' },
];

export default function Edit() {
    const { auth } = usePage().props;
    const form = useForm({ name: auth.user.name, username: auth.user.username ?? '', email: auth.user.email, password: '', password_confirmation: '' });

    const submit = (e) => {
        e.preventDefault();
        form.put('/profile', { preserveScroll: true, onSuccess: () => form.reset('password', 'password_confirmation') });
    };

    return (
        <AppLayout title="Profil">
            <div className="mx-auto max-w-xl">
                <h1 className="font-serif text-3xl font-bold text-teal-900">Profil saya</h1>
                <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-stone-300 bg-white p-6" noValidate>
                    {fields.map((f) => (
                        <div key={f.name}>
                            <label htmlFor={`profile-${f.name}`} className="mb-1 block text-sm font-semibold text-slate-800">{f.label}</label>
                            <input id={`profile-${f.name}`} type={f.type} autoComplete={f.auto} value={form.data[f.name]} onChange={(e) => form.setData(f.name, e.target.value)} aria-invalid={Boolean(form.errors[f.name])} className={inputCls} />
                            <FieldError message={form.errors[f.name]} />
                        </div>
                    ))}
                    <SubmitButton loading={form.processing}>Simpan profil</SubmitButton>
                </form>
            </div>
        </AppLayout>
    );
}
