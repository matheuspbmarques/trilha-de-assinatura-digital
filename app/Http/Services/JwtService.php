<?php

namespace App\Http\Services;

use Jose\Component\Core\AlgorithmManager;
use Jose\Component\Core\JWK;
use Jose\Component\KeyManagement\JWKFactory;
use Jose\Component\Signature\Algorithm\HS256;
use Jose\Component\Signature\JWSBuilder;
use Jose\Component\Signature\JWSVerifier;
use Jose\Component\Signature\Serializer\CompactSerializer;

class JwtService
{
    private AlgorithmManager $algorithmManager;

    private JWK $jwk;

    private CompactSerializer $serializer;

    public function __construct()
    {
        $this->jwk = JWKFactory::createFromSecret(env('APP_KEY', [
            'alg' => 'HS256',
            'use' => 'sig',
        ]));
        $this->algorithmManager = new AlgorithmManager([
            new HS256,
        ]);
        $this->serializer = new CompactSerializer;
    }

    public function sign(string $usuario_id): string
    {
        $payload = json_encode([
            'usuario_id' => $usuario_id,
        ]);

        $jwsBuilder = new JWSBuilder($this->algorithmManager);

        $jws = $jwsBuilder
            ->create()
            ->withPayload($payload)
            ->addSignature($this->jwk, ['alg' => 'HS256'])
            ->build();

        $token = $this->serializer->serialize($jws, 0);

        return $token;
    }

    public function verify(string $token): ?string
    {
        $jwsVerifier = new JWSVerifier($this->algorithmManager);

        $jws = $this->serializer->unserialize($token);

        $payload = json_decode($jws->getPayload());

        $isTokenValid = $jwsVerifier->verifyWithKey($jws, $this->jwk, 0);

        return $isTokenValid ? $payload->usuario_id : null;
    }
}
