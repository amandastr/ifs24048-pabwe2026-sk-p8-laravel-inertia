# P8 - Aplikasi Blog (Laravel 13 + Inertia.js + React + PostgreSQL)

Folder ini adalah **overlay**: berisi semua kode `app/`, `routes/`, `resources/`, `database/`, `tests/`, dan konfigurasi.
Cara pakai: buat proyek Laravel baru, pasang paket, lalu salin overlay ini di atasnya.

## 1. Prasyarat
PHP 8.4 (ext: pdo_pgsql, zip, gd, mbstring, xml, dom, simplexml, xmlreader, xmlwriter), Composer, Node 20+, PostgreSQL 17, serta pcov atau Xdebug untuk coverage.

## 2. Buat proyek dan pasang paket
```bash
composer create-project laravel/laravel ifs24048-pabwe2026-sk-p8-laravel-inertia
cd ifs24048-pabwe2026-sk-p8-laravel-inertia
composer require inertiajs/inertia-laravel phpoffice/phpspreadsheet
npm install
npm install react react-dom @inertiajs/react @vitejs/plugin-react @toast-ui/editor
```

## 3. Salin overlay (timpa file bawaan)
Windows PowerShell:
```powershell
Copy-Item -Recurse -Force ..\overlay\* .
Remove-Item -Force -ErrorAction SilentlyContinue resources\views\welcome.blade.php, tests\Feature\ExampleTest.php, tests\Unit\ExampleTest.php
```
Linux/macOS:
```bash
cp -R ../overlay/. . && rm -f resources/views/welcome.blade.php tests/Feature/ExampleTest.php tests/Unit/ExampleTest.php
```

## 4. Database dan .env
```bash
psql -U postgres -c "CREATE DATABASE pabwe_p8_blog;"
```
Ubah di `.env`:
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=pabwe_p8_blog
DB_USERNAME=postgres
DB_PASSWORD=postgres
APP_NAME="Blog Penulis"
APP_LOCALE=id
OPENAI_API_KEY=sk-...isi-key-anda
OPENAI_MODEL=gpt-4o-mini
```

## 5. Jalankan
```bash
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
npm run dev            # terminal 1 (mode pengembangan)
php artisan serve      # terminal 2 -> http://127.0.0.1:8000
```
Akun seed: `admin` / `password` (Admin) dan `penulis` / `password` (Penulis).

## 6. Uji (100% coverage)
```bash
php artisan test --coverage --min=100
composer audit
```
Jika ada baris belum tercakup: `php artisan test --coverage` lalu lihat kolom persen.

## 7. Build produksi (untuk Lighthouse/Axe dan deploy)
```bash
npm run build
php artisan config:cache && php artisan route:cache && php artisan view:cache
```
Pada deploy: set `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://ifs24048-pabwe2026-sk-p8-laravel-inertia...`, jalankan `php artisan migrate --force --seed` dan `php artisan storage:link`. Gunakan Jenkinsfile/CI yang sama seperti proyek P7 Anda.
