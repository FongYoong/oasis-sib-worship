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

export async function get_multiple_songs(song_ids: number[]) {
    const songs = await prisma.song.findMany({
        where: {
            id: { in: song_ids },
        }
    });
    return songs;
}

export async function get_session(session_id: number) {
    const song = await prisma.session.findFirst({
        where: {
            id: session_id,
        }
    });
    return song;
}