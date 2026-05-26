<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "Trilha de Assinatura Digital API",
    description: "Documentação da API REST do sistema de Trilha de Assinatura Digital."
)]
#[OA\Server(
    url: "http://localhost:8000/api",
    description: "Servidor de Desenvolvimento Local"
)]
class OpenApi
{
    // Esta classe serve apenas como contêiner para definições OpenAPI globais.
}
