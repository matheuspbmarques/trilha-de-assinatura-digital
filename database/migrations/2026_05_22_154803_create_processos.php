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
        Schema::create('processos', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('usuario_id');
            $table->string('titulo', 256);
            $table->string('descricao', 1024);
            $table->enum('status', ['Pendente', 'Em aprovação', 'Aprovado', 'Reprovado', 'Cancelado']);
            $table->string('categoria', 256);
            $table->string('url', 1024);
            $table->boolean('fluxo_sequencial')->default(false);
            $table->timestampTz('created_at')->default('NOW()');
            $table->timestampTz('updated_at')->default('NOW()');

            $table->foreign('usuario_id')->references('id')->on('usuarios');
        });

        Schema::create('processos_historico', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('processo_id');
            $table->enum('campo', ['titulo', 'descricao', 'status', 'categoria', 'url']);
            $table->string('descricao', 1024);
            $table->timestampTz('created_at')->default('NOW()');

            $table->foreign('processo_id')->references('id')->on('processos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('processos');
        Schema::dropIfExists('processos_historico');
    }
};
