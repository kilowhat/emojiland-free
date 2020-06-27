import Component from 'flarum/Component';

/* global m */

class EmojiImage extends Component {
    view() {
        return m('img', {
            src: 'https://twemoji.maxcdn.com/2/svg/' + this.props.emoji.h + '.svg',
            alt: this.props.emoji.i,
        });
    }
}

export default class EmojiItem extends Component {
    init() {
        this.showSkinSelector = false;
    }

    config(isInitialized) {
        if (isInitialized) {
            return;
        }

        let longPressTimer = null;
        let wasLongPress = false;

        this.$('> .Button').mousedown(() => {
            longPressTimer = window.setTimeout(() => {
                wasLongPress = true;
                if (this.props.emoji.s) {
                    this.showSkinSelector = true;
                    m.redraw();
                }
            }, 1000);

            wasLongPress = false;
        }).mouseup(() => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }).click(event => {
            if (wasLongPress) {
                event.stopPropagation();
            } else if (this.showSkinSelector) {
                this.showSkinSelector = false;
                m.redraw();
            } else {
                this.props.selectEmoji(this.props.emoji);
            }
        });
    }

    view() {
        return m('.PickerItem', [
            m('button.Button', {
                type: 'button',
                className: this.props.isSelected ? 'focus' : '',
                title: this.props.emoji.n,
            }, this.props.imageLoaded ? EmojiImage.component({
                emoji: this.props.emoji,
            }) : m('div.PickerLazyImage')),
            this.showSkinSelector ? m('.PickerSkins', [
                this.props.emoji.s.map(skinEmoji => m('button.Button', {
                    type: 'button',
                    title: skinEmoji.i,
                    onclick: () => {
                        this.props.selectEmoji(skinEmoji);
                        this.props.emoji.i = skinEmoji.i;
                        this.props.emoji.h = skinEmoji.h;

                        app.request({
                            method: 'POST',
                            url: app.forum.attribute('apiUrl') + '/emojiland/my-tone-preference',
                            data: {
                                base: this.props.emoji.s[0].i,
                                alternate: skinEmoji.i,
                            },
                        }).then(data => {
                            // Do nothing
                        });
                    },
                }, EmojiImage.component({
                    emoji: skinEmoji,
                }))),
            ]) : null,
        ]);
    }
}
