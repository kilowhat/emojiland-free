import app from 'flarum/app';
import BaseSettingsModal from 'flarum/components/SettingsModal';
import Switch from 'flarum/components/Switch';

/* global m */

const settingsPrefix = 'emojiland.';
const translationPrefix = 'kilowhat-emojiland.admin.settings.';

export default class SettingsModal extends BaseSettingsModal {
    title() {
        return app.translator.trans(translationPrefix + 'title');
    }

    form() {
        const switchSetting = (settingSuffix, labelSuffix, defaultValue, help = false) => {
            return m('.Form-group', [
                Switch.component({
                    state: this.setting(settingsPrefix + settingSuffix, defaultValue ? '1' : '0')() === '1',
                    onchange: value => {
                        this.setting(settingsPrefix + settingSuffix)(value ? '1' : '0');
                    },
                    children: app.translator.trans(translationPrefix + labelSuffix),
                }),
                help ? m('.helpText', app.translator.trans(translationPrefix + labelSuffix + 'Help')) : null,
            ]);
        };

        return [
            switchSetting('searchEnglish', 'searchEnglish', false, true),
            switchSetting('hideFlarumButton', 'hideFlarumButton', true, true),
        ];
    }
}
