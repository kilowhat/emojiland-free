import app from 'flarum/app';
import Component from 'flarum/Component';
import Button from 'flarum/components/Button';
import LoadingIndicator from 'flarum/components/LoadingIndicator';
import icon from 'flarum/helpers/icon';
import EmojiCategory from './EmojiCategory';
import searchEmojis from '../helpers/searchEmojis';

/* global m */

const translationPrefix = 'kilowhat-emojiland.forum.';

export default class EmojiPicker extends Component {
    init() {
        this.search = '';
        this.tabIndex = 0;
        this.selectedIndex = 0;

        if (!app.emojilandPacks) {
            app.request({
                method: 'GET',
                url: app.forum.attribute('apiUrl') + '/emojiland/my-packs',
            }).then(data => {
                app.emojilandPacks = data;
                m.redraw();
            });
        }
    }

    config(isInitialized) {
        if (isInitialized) {
            return;
        }

        const $input = this.$('input');

        $input.on('keydown', event => {
            switch (event.key) {
                case 'ArrowLeft':
                    this.updateIndex(this.selectedIndex - 1);
                    break;
                case 'ArrowRight':
                    this.updateIndex(this.selectedIndex + 1);
                    break;
                case 'ArrowUp':
                    this.updateIndex(this.selectedIndex - 9);
                    break;
                case 'ArrowDown':
                    this.updateIndex(this.selectedIndex + 9);
                    break;
                case 'Enter':
                    this.$('.focus').click();
                    break;
                case 'Escape':
                    if (this.search) {
                        event.stopPropagation();
                        this.search = '';
                        this.selectedIndex = 0;
                        m.redraw();
                    }
                    break;
                default:
                    return;
            }

            event.preventDefault();
        });

        $input.focus();
    }

    updateIndex(index) {
        if (!app.emojilandPacks) {
            return;
        }

        // TODO: do not overflow when the list is searched
        if (index >= 0 && index < app.emojilandPacks.reduce((total, pack) => total + pack.emojis.length, 0)) {
            this.selectedIndex = index;
            m.redraw();
        }
    }

    view() {
        let selectedIndexOffset = 0;

        return m('.Picker', {
            className: this.search ? 'Picker--searching' : '',
        }, [
            m('.PickerSearch', [
                m('input.FormControl', {
                    placeholder: app.translator.trans(translationPrefix + 'picker.searchPlaceholder'),
                    value: this.search,
                    oninput: event => {
                        this.search = event.target.value;
                        this.tabIndex = 0;
                        this.selectedIndex = 0;
                    },
                }),
                this.search ? Button.component({
                    className: 'Search-clear Button Button--icon Button--link js-picker-clear-search',
                    onclick: () => {
                        this.search = '';
                        this.selectedIndex = 0;
                    },
                    icon: 'fas fa-times-circle js-picker-clear-search',
                    title: app.translator.trans(translationPrefix + 'picker.clearSearch'),
                }) : null,
            ]),
            app.emojilandPacks ? [
                m('.PickerScroll', {
                    onscroll: () => {
                        const $scroll = this.$('.PickerScroll');

                        const offsetTop = $scroll.offset().top;

                        [].some.call(this.element.querySelectorAll('.js-emojiland-pack'), (element, index) => {
                            if ($(element).offset().top + $(element).outerHeight() - offsetTop > 100) {
                                if (index !== this.tabIndex) {
                                    this.tabIndex = index;
                                    m.redraw();
                                }
                                return true;
                            }
                            return false;
                        });

                        m.redraw.strategy('none');
                    },
                }, this.search ? EmojiCategory.component({
                    selectEmoji: this.selectEmoji.bind(this),
                    key: 'search-' + this.search,
                    emojis: searchEmojis(app.emojilandPacks, this.search),
                    selectedIndex: this.selectedIndex,
                }) : app.emojilandPacks.map(pack => {
                    const vnode = m('.js-emojiland-pack', {
                        key: pack.key,
                    }, [
                        m('h5', app.translator.trans(translationPrefix + 'categories.' + pack.key)),
                        EmojiCategory.component({
                            selectEmoji: this.selectEmoji.bind(this),
                            emojis: pack.emojis,
                            selectedIndex: this.selectedIndex - selectedIndexOffset,
                        }),
                    ]);

                    selectedIndexOffset += pack.emojis.length;

                    return vnode;
                })),
                m('ul.PickerPacks', app.emojilandPacks.map((pack, index) => m('li', Button.component({
                    className: 'Button' + (this.tabIndex === index ? ' active' : ''),
                    title: app.translator.trans(translationPrefix + 'categories.' + pack.key),
                    disabled: !!this.search,
                    onclick: () => {
                        const $scroll = this.$('.PickerScroll');

                        const scrollTop = $scroll.scrollTop() + Math.round($(this.element.querySelectorAll('.js-emojiland-pack')[index]).offset().top - $scroll.offset().top);

                        $scroll.stop().animate({
                            scrollTop,
                        }, 300);
                    },
                }, icon(pack.icon))))),
            ] : m('.PickerLoader', LoadingIndicator.component()),
        ]);
    }

    selectEmoji(emoji) {
        this.props.oninsert(emoji.i);
    }
}
