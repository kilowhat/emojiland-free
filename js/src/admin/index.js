import {extend} from 'flarum/extend';
import app from 'flarum/app';
import SettingsModal from './components/SettingsModal';

app.initializers.add('kilowhat-emojiland-free', () => {
    app.extensionSettings['kilowhat-emojiland-free'] = () => app.modal.show(new SettingsModal());
});
