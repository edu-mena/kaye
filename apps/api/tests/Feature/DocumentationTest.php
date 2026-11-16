<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

/**
 * Keeps the documentation honest: what exists in the code must be described
 * in docs/. See docs/engenharia.md (Definição de Pronto).
 */
class DocumentationTest extends TestCase
{
    use RefreshDatabase;

    public function test_every_database_table_is_documented(): void
    {
        $doc = $this->doc('base-de-dados.md');

        // Only this app's database: the server may host other projects' databases.
        $tables = Schema::getTableListing(Schema::getCurrentSchemaName(), schemaQualified: false);

        $this->assertContains('users', $tables);
        foreach ($tables as $table) {
            $this->assertStringContainsString("`{$table}`", $doc, "Table {$table} is missing from docs/base-de-dados.md");
        }
    }

    public function test_every_environment_variable_is_documented(): void
    {
        $doc = $this->doc('infraestrutura.md');
        preg_match_all('/^([A-Z][A-Z0-9_]*)=/m', File::get(base_path('.env.example')), $matches);

        $this->assertNotEmpty($matches[1]);
        foreach ($matches[1] as $variable) {
            $this->assertStringContainsString("`{$variable}`", $doc, "{$variable} is missing from docs/infraestrutura.md");
        }
    }

    public function test_every_variable_of_the_web_app_is_documented(): void
    {
        $doc = $this->doc('infraestrutura.md');
        preg_match_all('/readonly (VITE_[A-Z0-9_]+)\??:/', File::get(base_path('../web/src/env.d.ts')), $matches);

        $this->assertContains('VITE_DATA_SOURCE', $matches[1]);
        foreach ($matches[1] as $variable) {
            $this->assertStringContainsString("`{$variable}`", $doc, "{$variable} is missing from docs/infraestrutura.md");
        }
    }

    public function test_every_decision_record_is_in_the_index(): void
    {
        $index = $this->doc('decisoes/README.md');
        $records = File::glob($this->docsPath('decisoes/[0-9][0-9][0-9][0-9]-*.md'));

        $this->assertNotEmpty($records);
        foreach ($records as $record) {
            $this->assertIsString($record);
            $name = basename($record);
            $this->assertStringContainsString("({$name})", $index, "{$name} is missing from docs/decisoes/README.md");
        }
    }

    private function doc(string $name): string
    {
        return File::get($this->docsPath($name));
    }

    private function docsPath(string $name): string
    {
        return base_path("../../docs/{$name}");
    }
}
