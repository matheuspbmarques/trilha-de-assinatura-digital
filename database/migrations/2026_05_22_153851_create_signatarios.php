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
        Schema::create('signatarios', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique()->default(DB::raw('gen_random_uuid()'));
            $table->string('nome', '256');
            $table->string('email', '256')->unique();
            $table->string('cargo', '256');
            $table->string('setor', '256');
            $table->boolean('ativo')->default(true);
            $table->timestamps();
        });

        Schema::create('signatarios_historico', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('signatario_id');
            $table->enum('campo', ['nome', 'email', 'cargo', 'setor', 'senha', 'ativo']);
            $table->string('descricao', 1024);
            $table->timestampTz('created_at');

            $table->foreign('signatario_id')->references('id')->on('signatarios');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('signatarios');
        Schema::dropIfExists('signatarios_historico');
    }
};
