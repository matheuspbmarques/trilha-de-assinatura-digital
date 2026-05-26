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
        Schema::table('signatarios_processos', function (Blueprint $table) {
            $table->enum('status', ['Pendente', 'Aprovado', 'Reprovado'])->default('Pendente');
            $table->string('token', 64)->nullable()->unique();
            $table->timestampTz('token_expira_em')->nullable();
            $table->timestampTz('respondido_em')->nullable();
            $table->string('justificativa', 1024)->nullable();
            $table->string('ip_requisicao', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('signatarios_processos', function (Blueprint $table) {
            $table->dropColumn(['status', 'token', 'token_expira_em', 'respondido_em', 'justificativa', 'ip_requisicao', 'user_agent']);
        });
    }
};
