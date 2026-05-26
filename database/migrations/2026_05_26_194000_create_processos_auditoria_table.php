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
        Schema::create('processos_auditoria', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('processo_id');
            $table->uuid('usuario_id')->nullable();
            $table->uuid('signatario_id')->nullable();
            $table->string('acao', 255);
            $table->string('descricao', 1024);
            $table->json('dados_anteriores')->nullable();
            $table->json('dados_novos')->nullable();
            $table->timestampTz('created_at')->default(DB::raw('NOW()'));

            $table->foreign('processo_id')->references('id')->on('processos')->onDelete('cascade');
            $table->foreign('usuario_id')->references('id')->on('usuarios')->onDelete('set null');
            $table->foreign('signatario_id')->references('id')->on('signatarios')->onDelete('set null');

            $table->index('processo_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('processos_auditoria');
    }
};
