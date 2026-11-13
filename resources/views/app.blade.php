<!DOCTYPE html>
<html lang="id">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="Blog komunitas penulis Indonesia: baca artikel teknologi, pendidikan, gaya hidup, bisnis, dan opini, atau daftar untuk mulai menulis.">
        <meta name="theme-color" content="#115e59">
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%23115e59'/%3E%3Ctext x='50' y='68' font-size='56' text-anchor='middle' fill='white' font-family='Georgia'%3EB%3C/text%3E%3C/svg%3E">
        <title inertia>{{ config('app.name', 'Blog') }}</title>
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
        @inertiaHead
    </head>
    <body class="bg-stone-50 text-slate-900 antialiased">
        @inertia
    </body>
</html>
