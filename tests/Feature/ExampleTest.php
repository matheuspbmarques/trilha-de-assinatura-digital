<?php

test('returns a successful response', function () {
    $response = $this->get(route('auth.sign-in'));

    $response->assertOk();
});
