/* eslint-disable jsx-a11y/alt-text */
import prisma from './prisma'
import HTMLtoDOCX from 'html-to-docx'

export async function convertHTMLToWord(htmlString: string) {
    console.log('docccc')
    console.log(HTMLtoDOCX)
    const fileBuffer: Buffer = await HTMLtoDOCX(htmlString, null, {
        table: { row: { cantSplit: true } },
        //footer: true,
        //pageNumber: true,
    }, null);
    return fileBuffer
}

export async function get_song(song_id: number) {
    const song = await prisma.song.findFirst({
        where: {
            id: song_id,
        }
    });
    return song;
}

