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
        Schema::create('usuarios', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique()->default(DB::raw('gen_random_uuid()'));
            $table->string('acesso', 8)->unique();
            $table->string('senha');
            $table->timestampTz('created_at')->default('NOW()');
            $table->timestampTz('updated_at')->default('NOW()');
        });

        Schema::create('usuarios_historico', function (Blueprint $table) {
            $table->uuid('id')->primary()->unique()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('usuario_id');
            $table->enum('campo', ['acesso', 'senha']);
            $table->string('descricao', 1024);
            $table->timestampTz('created_at')->default('NOW()');

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
