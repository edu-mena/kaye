<?php

namespace App\Support;

use RuntimeException;

/**
 * A Google ID token that must not open a session: forged, expired, for another app or from another issuer.
 */
class InvalidGoogleToken extends RuntimeException {}
