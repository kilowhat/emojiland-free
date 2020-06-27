import {extend} from 'flarum/extend';
import app from 'flarum/app';
import Button from 'flarum/components/Button';
import TextEditor from 'flarum/components/TextEditor';
import EmojiPicker from './components/EmojiPicker';

app.initializers.add('kilowhat-emojiland', () => {
    extend(TextEditor.prototype, 'init', function () {
        this.emojilandOpen = false;
    });

    extend(TextEditor.prototype, 'config', function (element, isInitialized, context) {
        if (isInitialized) {
            return;
        }

        const clickedOutside = event => {
            if (!this.emojilandOpen) {
                return;
            }

            const $target = $(event.target);

            // If we clicked on the popup we don't do anything
            if (
                $target.is('.Picker') || // Click on the picker container
                $target.is('.js-picker-clear-search') || // Click on the clear search button. We can't check it with .parents() because it's already removed from the DOM at this point
                $target.parents('.Picker').length || // Click inside of the picker
                $target.parents('.Button-emojiland').length // Click on the button to toggle the picker
            ) {
                return;
            }

            this.emojilandOpen = false;
            m.redraw();
        };

        document.addEventListener('click', clickedOutside);

        const previousUnload = context.onunload;
        context.onunload = () => {
            if (previousUnload) {
                previousUnload();
            }
            document.removeEventListener('click', clickedOutside);
        };
    });

    extend(TextEditor.prototype, 'view', function (vdom) {
        if (this.emojilandOpen) {
            vdom.children.push(EmojiPicker.component({
                oninsert: insert => {
                    this.insertAtCursor(insert);
                    this.emojilandOpen = false;
                }
            }));
        }
    });

    extend(TextEditor.prototype, 'toolbarItems', function (items) {
        // Not using the TextEditorButton component because the tooltip apparently won't go away once the picker is open
        items.add('kilowhat-emojiland', Button.component({
            onclick: () => {
                this.emojilandOpen = !this.emojilandOpen;
            },
            className: 'Button Button--icon Button--link Button-emojiland',
            icon: 'far fa-smile-beam',
            title: app.translator.trans('kilowhat-emojiland.forum.toolbar.button'),
        }));

        if (app.forum.attribute('emojilandHideFlarumButton') && items.has('emoji')) {
            items.remove('emoji');
        }
    });
});
