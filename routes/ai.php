<?php

use App\Http\Middleware\EnsureMcpToken;
use App\Mcp\Servers\KayeServer;
use Laravel\Mcp\Facades\Mcp;

// The team's AI (docs/ia.md): only with an MCP token made in the panel (ability `mcp`), never a session cookie.
Mcp::web('/mcp', KayeServer::class)->middleware(['auth:sanctum', EnsureMcpToken::class, 'throttle:mcp']);
