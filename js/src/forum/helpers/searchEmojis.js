export default function (packs, search) {
    const searchLowercase = search.toLowerCase();
    const emojis = [];

    packs.forEach(pack => {
        pack.emojis.forEach(emoji => {
            // Check if the annotation starts with the search string
            // or if the search string exists after a space in the annotation
            // or if one of the tag starts with the search string
            if (
                emoji.n.indexOf(searchLowercase) === 0 ||
                //emoji.n.indexOf(' ' + searchLowercase) !== -1 || //TODO:keep?
                emoji.k.indexOf(searchLowercase) === 0 ||
                emoji.k.indexOf('\t' + searchLowercase) !== -1
            ) {
                emojis.push(emoji);
            }
        });
    });

    return emojis;
}
