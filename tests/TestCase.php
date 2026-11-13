<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config(['inertia.pages.paths' => [resource_path('js/Pages')]]);
        $this->app->forgetInstance('inertia.view-finder');
    }
}