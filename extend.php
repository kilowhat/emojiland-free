<?php

namespace Kilowhat\Emojiland;

use Flarum\Extend;
use s9e\TextFormatter\Configurator;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . '/js/dist/forum.js')
        ->css(__DIR__ . '/resources/less/forum.less'),

    (new Extend\Frontend('admin'))
        ->js(__DIR__ . '/js/dist/admin.js')
        ->css(__DIR__ . '/resources/less/admin.less'),

    (new Extend\Routes('api'))
        ->get('/emojiland/my-packs', 'emojiland.my-packs', Controllers\PacksListController::class)
        ->post('/emojiland/my-tone-preference', 'emojiland.my-preference', Controllers\TonePreferenceController::class),

    new Extend\Locales(__DIR__ . '/resources/locale'),

    (new Extend\Formatter)
        ->configure(function (Configurator $config) {
            $config->Emoji;
        }),

    new Extenders\ForumAttributes(),
];
