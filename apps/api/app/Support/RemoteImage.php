<?php

namespace App\Support;

use Closure;
use finfo;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Throwable;

/**
 * attach_image's download (docs/ia.md): an image the AI found on the web, fetched by the server. A URL is the
 * server's own request, so it is guarded like one (SSRF): only https, only hosts whose every address is public, no
 * redirects, a size cap, and a real JPEG, PNG or WebP of a sensible size. It is kept outside `public/`
 * (`storage/app/private/ai-images`) until a reviewer approves the revision.
 */
final class RemoteImage
{
    public const DISK = 'local';

    public const FOLDER = 'ai-images';

    /** @var Closure(string): list<string> */
    private Closure $resolve;

    /**
     * @param  (Closure(string): list<string>)|null  $resolve  the host's addresses (tests give their own)
     */
    public function __construct(?Closure $resolve = null)
    {
        $this->resolve = $resolve ?? static function (string $host): array {
            $addresses = [];
            foreach ([DNS_A, DNS_AAAA] as $kind) {
                foreach (@dns_get_record($host, $kind) ?: [] as $record) {
                    $address = $record['ip'] ?? $record['ipv6'] ?? null;
                    if (is_string($address)) {
                        $addresses[] = $address;
                    }
                }
            }

            return $addresses;
        };
    }

    /**
     * The stored file's path on the private disk.
     *
     * @throws InvalidProposal
     */
    public function fetch(string $url): string
    {
        $address = $this->guard($url);
        $host = (string) parse_url($url, PHP_URL_HOST);
        $port = parse_url($url, PHP_URL_PORT) ?? 443;
        $address = str_contains($address, ':') ? "[{$address}]" : $address;

        try {
            // The connection goes to the address just checked, not to a second DNS answer (DNS rebinding).
            $response = Http::withOptions(['allow_redirects' => false, 'curl' => [CURLOPT_RESOLVE => ["{$host}:{$port}:{$address}"]]])->timeout(20)->connectTimeout(10)
                ->withHeaders(['Accept' => 'image/jpeg, image/png, image/webp'])->get($url);
        } catch (Throwable) {
            throw new InvalidProposal(['The image could not be downloaded.']);
        }
        if ($response->redirect()) {
            throw new InvalidProposal(['The image URL redirects: give the final address of the file itself.']);
        }
        if (! $response->successful()) {
            throw new InvalidProposal(["The image URL answered {$response->status()}."]);
        }

        $bytes = $response->body();
        $max = Config::integer('ai.image_max_bytes');
        if (strlen($bytes) > $max) {
            throw new InvalidProposal(['The image is larger than '.intdiv($max, 1_000_000).' MB.']);
        }
        $type = (new finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
        $extensions = Config::array('ai.image_types');
        $size = @getimagesizefromstring($bytes);
        if (! is_string($type) || ! isset($extensions[$type]) || $size === false) {
            throw new InvalidProposal(['Only JPEG, PNG or WebP images are accepted.']);
        }
        if ($size[0] < 64 || $size[1] < 64 || $size[0] > 8000 || $size[1] > 8000) {
            throw new InvalidProposal(['The image must be between 64 and 8000 pixels on each side.']);
        }

        $path = self::FOLDER.'/'.hash('sha256', $bytes).'.'.JsonValue::string($extensions[$type]);
        Storage::disk(self::DISK)->put($path, $bytes);

        return $path;
    }

    /**
     * The address to connect to, once every address of the host is public.
     *
     * @throws InvalidProposal
     */
    private function guard(string $url): string
    {
        $host = parse_url($url, PHP_URL_HOST);
        if (parse_url($url, PHP_URL_SCHEME) !== 'https' || ! is_string($host) || $host === '' || parse_url($url, PHP_URL_USER) !== null) {
            throw new InvalidProposal(['The image URL must be https, without a user or password.']);
        }
        $addresses = filter_var($host, FILTER_VALIDATE_IP) !== false ? [$host] : ($this->resolve)($host);
        if ($addresses === []) {
            throw new InvalidProposal(['The image host does not resolve.']);
        }
        foreach ($addresses as $address) {
            if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                throw new InvalidProposal(['The image host points to a private or reserved address.']);
            }
        }

        return $addresses[0];
    }
}
