import Component from 'flarum/Component';
import chunkArray from '../helpers/chunkArray';
import EmojiRow from './EmojiRow';

/* global m */

const CHUNK_SIZE = 9 * 4; // 9 per rows, 4 rows at a time to improve loading performance

export default class EmojiCategory extends Component {
    view() {
        return m('div', chunkArray(this.props.emojis, CHUNK_SIZE).map((emojis, index) => EmojiRow.component({
            selectEmoji: this.props.selectEmoji,
            emojis,
            selectedIndex: this.props.selectedIndex - (index * CHUNK_SIZE),
        })));
    }
}
