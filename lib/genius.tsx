
export function geniusLyricsToHTML(lyrics?: string) {
    let finalLyrics = '';
    if (lyrics) {
        lyrics.split('\n').forEach((line) => {
            if (!/\S/.test(line)) {
                // whitespace
                finalLyrics += '<br/>';
            }
            // else if (/\[.*\]/.test(line)) {
            // }
            else {
                const matches = line.match(/\[(.*)\]/);
                if(matches) {
                    console.log(matches)
                    finalLyrics += `<h2>${matches[1]}</h2>`;
                }
                else {
                    finalLyrics += `<p>${line}</p>`;
                }
            }
        })
    }
    console.log(finalLyrics)
    return finalLyrics;
}