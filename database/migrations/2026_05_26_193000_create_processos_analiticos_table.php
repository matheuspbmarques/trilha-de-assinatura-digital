<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('processos_analiticos', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('processo_id');
            $table->uuid('usuario_id');
            $table->string('titulo', 256);
            $table->string('categoria', 256);
            $table->string('status', 64);
            $table->uuid('signatario_id')->nullable();
            $table->string('signatario_nome', 256)->nullable();
            $table->string('signatario_cargo', 256)->nullable();
            $table->timestampTz('data_criacao');
            $table->timestampTz('data_resposta')->nullable();
            $table->string('tipo_resposta', 64)->nullable();
            $table->decimal('tempo_resposta_em_horas', 8, 2)->nullable();
            $table->string('justificativa_reprovacao', 1024)->nullable();
            $table->timestampTz('created_at')->default('NOW()');
            $table->timestampTz('updated_at')->default('NOW()');

            $table->index('usuario_id');
            $table->index('processo_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('processos_analiticos');
    }
};
