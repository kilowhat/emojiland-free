<?php

namespace Kilowhat\Emojiland\Controllers;

use Flarum\Foundation\Application;
use Flarum\Foundation\ValidationException;
use Flarum\User\User;
use Illuminate\Support\Arr;
use Laminas\Diactoros\Response\EmptyResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class TonePreferenceController implements RequestHandlerInterface
{
    protected $app;

    public function __construct(Application $app)
    {
        $this->app = $app;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $filename = $this->app->vendorPath() . '/kilowhat/emojiland-data/dist/en.json';

        $data = file_get_contents($filename);

        if ($data === false) {
            throw new \Exception("Could not read emoji data file at $filename");
        }

        $packs = json_decode($data, true);

        $body = $request->getParsedBody();

        $base = Arr::get($body, 'base');
        $alternate = Arr::get($body, 'alternate');

        foreach ($packs as $pack) {
            foreach ($pack['emojis'] as $emoji) {
                if (Arr::exists($emoji, 's') && $emoji['s'][0]['i'] === $base) {
                    $validAlternate = false;

                    foreach ($emoji['s'] as $skinEmoji) {
                        if ($skinEmoji['i'] === $alternate) {
                            $validAlternate = true;
                        }
                    }

                    if (!$validAlternate) {
                        throw new ValidationException([
                            'alternate' => "Emoji $alternate does not appear to be a valid alternative to base $base",
                        ]);
                    }

                    /**
                     * @var $user User
                     */
                    $user = $request->getAttribute('actor');

                    $preferences = json_decode($user->getOriginal('preferences'), true);

                    $tonesMapping = Arr::get($preferences, 'emojilandTones');

                    if (!is_array($tonesMapping)) {
                        $tonesMapping = [];
                    }

                    if ($base === $alternate) {
                        if (Arr::exists($tonesMapping, $base)) {
                            unset($tonesMapping[$base]);

                            if (count($tonesMapping)) {
                                $preferences['emojilandTones'] = $tonesMapping;
                            } else {
                                unset($preferences['emojilandTones']);
                            }

                            $user->preferences = $preferences;
                        }
                    } else if (Arr::get($tonesMapping, $base) !== $alternate) {
                        $tonesMapping[$base] = $alternate;

                        $preferences['emojilandTones'] = $tonesMapping;
                        $user->preferences = $preferences;
                    }

                    $user->save();

                    return new EmptyResponse();
                }
            }
        }

        throw new ValidationException([
            'base' => "Base emoji $base does not appear valid",
        ]);
    }
}
