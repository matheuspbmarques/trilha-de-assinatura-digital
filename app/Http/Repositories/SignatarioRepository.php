<?php

namespace App\Http\Repositories;

use App\Models\Signatario;

class SignatarioRepository {
    public function createNew(string $nome, string $email, string $cargo, string $setor) {
        $newSignatario = new Signatario();

        $newSignatario->nome = $nome;
        $newSignatario->email = $email;
        $newSignatario->cargo = $cargo;
        $newSignatario->setor = $setor;
        $newSignatario->created_at = now();
        $newSignatario->updated_at = now();

        $newSignatario->save();
    }

    public function findAll() {
        return Signatario::orderBy('created_at', 'asc')->get();
    }

    public function updateById(string $id, string $nome, string $email, string $cargo, string $setor, bool $ativo) {
        $signatario = Signatario::whereId($id)->first();

        if (!$signatario) {
            abort(404, 'Signatário não encontrado');
        }

        $changes = [];

        if ($signatario->nome !== $nome) {
            $changes[] = [
                'campo' => 'nome',
                'descricao' => "Nome alterado de '{$signatario->nome}' para '{$nome}'",
            ];
            $signatario->nome = $nome;
        }

        if ($signatario->email !== $email) {
            $changes[] = [
                'campo' => 'email',
                'descricao' => "E-mail alterado de '{$signatario->email}' para '{$email}'",
            ];
            $signatario->email = $email;
        }

        if ($signatario->cargo !== $cargo) {
            $changes[] = [
                'campo' => 'cargo',
                'descricao' => "Cargo alterado de '{$signatario->cargo}' para '{$cargo}'",
            ];
            $signatario->cargo = $cargo;
        }

        if ($signatario->setor !== $setor) {
            $changes[] = [
                'campo' => 'setor',
                'descricao' => "Setor alterado de '{$signatario->setor}' para '{$setor}'",
            ];
            $signatario->setor = $setor;
        }

        $ativoBool = (bool)$ativo;

        if ((bool)$signatario->ativo !== $ativoBool) {
            $changes[] = [
                'campo' => 'ativo',
                'descricao' => "Status alterado de '" . ($signatario->ativo ? 'ativo' : 'inativo') . "' para '" . ($ativoBool ? 'ativo' : 'inativo') . "'",
            ];
            $signatario->ativo = $ativoBool;
        }

        if (!empty($changes)) {
            $signatario->updated_at = now();
            $signatario->save();

            foreach ($changes as $change) {
                $historico = new \App\Models\SignatarioHistorico();
                $historico->signatario_id = $signatario->id;
                $historico->campo = $change['campo'];
                $historico->descricao = $change['descricao'];
                $historico->created_at = now();
                $historico->save();
            }
        }
    }
}
