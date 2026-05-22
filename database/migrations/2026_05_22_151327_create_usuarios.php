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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->uuid('id')->unique();
            $table->string('acesso', 8)->unique();
            $table->string('senha');
            $table->timestamps();
        });

        Schema::create('usuarios_historico', function (Blueprint $table) {
            $table->uuid('id')->unique();
            $table->uuid('usuario_id');
            $table->enum('campo', ['acesso', 'senha']);
            $table->string('descricao', 1024);
            $table->timestampTz('created_at');

            $table->foreign('usuario_id')->references('id')->on('usuarios');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usuarios');
        Schema::dropIfExists('usuarios_historico');
    }
};
