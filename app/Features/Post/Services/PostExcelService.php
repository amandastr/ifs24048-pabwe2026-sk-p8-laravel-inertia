<?php

namespace App\Features\Post\Services;

use App\Features\Post\Enums\PostCategory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PostExcelService
{
    public const HEADERS = ['Judul', 'Kategori', 'Ringkasan', 'Konten', 'Status', 'Dipublikasikan'];

    private const PUBLISHED_WORDS = ['dipublikasikan', 'published', 'publikasi', 'terbit', '1', 'ya'];

    public function __construct(private readonly PostService $posts)
    {
    }

    public function export(Collection $posts, string $filename, bool $withAuthor = false): StreamedResponse
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Artikel');

        $this->writeRow($sheet, 1, $withAuthor ? ['Penulis', ...self::HEADERS] : self::HEADERS);

        $row = 2;
        foreach ($posts as $post) {
            $values = [
                $post->title,
                $post->category,
                $post->excerpt,
                $post->content,
                $post->is_published ? 'Dipublikasikan' : 'Draf',
                $post->published_at?->format('Y-m-d H:i:s'),
            ];
            $this->writeRow($sheet, $row++, $withAuthor ? [$post->user?->name, ...$values] : $values);
        }

        return response()->streamDownload(
            function () use ($spreadsheet): void {
                (new Xlsx($spreadsheet))->save('php://output');
            },
            $filename,
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        );
    }

    public function import(User $user, UploadedFile $file): int
    {
        $rows = IOFactory::load($file->getRealPath())->getActiveSheet()->toArray(null, true, false, false);
        array_shift($rows);

        $count = 0;
        foreach ($rows as $row) {
            $title = trim((string) ($row[0] ?? ''));
            if ($title === '') {
                continue;
            }

            $excerpt = trim((string) ($row[2] ?? ''));
            $status = strtolower(trim((string) ($row[4] ?? '')));

            $this->posts->create($user, [
                'title' => $title,
                'category' => PostCategory::tryFrom(trim((string) ($row[1] ?? '')))?->value ?? PostCategory::Umum->value,
                'excerpt' => $excerpt !== '' ? $excerpt : null,
                'content' => (string) ($row[3] ?? ''),
                'is_published' => in_array($status, self::PUBLISHED_WORDS, true),
            ]);
            $count++;
        }

        return $count;
    }

    private function writeRow(Worksheet $sheet, int $row, array $values): void
    {
        foreach (array_values($values) as $index => $value) {
            // Selalu simpan sebagai teks agar sel tidak dieksekusi sebagai formula.
            $sheet->setCellValueExplicit([$index + 1, $row], (string) $value, DataType::TYPE_STRING);
        }
    }
}
