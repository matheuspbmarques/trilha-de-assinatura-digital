<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('signatarios_processos', function (Blueprint $table) {
            $table->uuid('id')->unique();
            $table->uuid('signatario_id');
            $table->uuid('processo_id');
            $table->timestampTz('created_at');

            $table->foreign('signatario_id')->references('id')->on('signatarios');
            $table->foreign('processo_id')->references('id')->on('processos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('signatarios_processos');
    }
};
