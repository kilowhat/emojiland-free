<?php

namespace Kilowhat\Emojiland\Controllers;

use Flarum\Foundation\Application;
use Flarum\Locale\LocaleManager;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\User;
use Illuminate\Support\Arr;
use Laminas\Diactoros\Response\JsonResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class PacksListController implements RequestHandlerInterface
{
    protected $app;
    protected $locale;
    protected $settings;

    const SUPPORTED_LOCALES = [
        'en',
        'fr',
        'de',
    ];

    public function __construct(Application $app, LocaleManager $locale, SettingsRepositoryInterface $settings)
    {
        $this->app = $app;
        $this->locale = $locale;
        $this->settings = $settings;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $locale = $this->locale->getLocale();

        if (!in_array($locale, self::SUPPORTED_LOCALES)) {
            $locale = self::SUPPORTED_LOCALES[0];
        }

        if ($locale !== 'en' && $this->settings->get('emojiland.searchEnglish')) {
            $locale .= '-with-en';
        }

        $filename = $this->app->vendorPath() . "/kilowhat/emojiland-data/dist/$locale.json";

        $data = file_get_contents($filename);

        if ($data === false) {
            throw new \Exception("Could not read emoji data file at $filename");
        }

        /**
         * @var $user User
         */
        $user = $request->getAttribute('actor');

        $tonesMapping = Arr::get(json_decode($user->getOriginal('preferences'), true), 'emojilandTones');

        if (!is_array($tonesMapping)) {
            $tonesMapping = [];
        }

        return new JsonResponse(array_map(function (array $pack) use ($tonesMapping): array {
            return Arr::except($pack, 'emojis') + [
                    'emojis' => array_map(function (array $emoji) use ($tonesMapping): array {
                        if (Arr::exists($emoji, 's')) {
                            // Default emoji for skins is the first one (neutral/yellow)
                            $emoji['i'] = $emoji['s'][0]['i'];
                            $emoji['h'] = $emoji['s'][0]['h'];

                            $mapping = Arr::get($tonesMapping, $emoji['s'][0]['i']);

                            // If a custom preference is saved for the user, retrieve the value
                            // If it's not found, the defaults will automatically stay
                            if ($mapping) {
                                foreach ($emoji['s'] as $skinEmoji) {
                                    if ($skinEmoji['i'] === $mapping) {
                                        $emoji['i'] = $skinEmoji['i'];
                                        $emoji['h'] = $skinEmoji['h'];

                                        break;
                                    }
                                }
                            }
                        }

                        return $emoji;
                    }, $pack['emojis']),
                ];
        }, json_decode($data, true)));
    }
}
