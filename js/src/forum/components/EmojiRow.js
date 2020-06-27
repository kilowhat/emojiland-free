import Component from 'flarum/Component';
import EmojiItem from './EmojiItem';

/* global m */

export default class EmojiRow extends Component {
    init() {
        this.imageLoaded = false;
    }

    view() {
        return m('.PickerItems', this.props.emojis.map((emoji, index) => EmojiItem.component({
            selectEmoji: this.props.selectEmoji,
            isSelected: this.props.selectedIndex === index,
            imageLoaded: this.imageLoaded,
            emoji,
        })));
    }

    config(isInitialized) {
        if (isInitialized) return;

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    observer.unobserve(this.element);
                    this.imageLoaded = true;
                    m.redraw();
                }
            });
        });

        observer.observe(this.element);
    }
}
