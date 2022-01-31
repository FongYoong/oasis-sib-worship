/* eslint-disable jsx-a11y/alt-text */
import { UNAUTHORISED_ERROR_CODE } from './status_codes'
import prisma from './prisma'
import HTMLtoPDF from 'html-pdf'
import HTMLtoDOCX from 'html-to-docx'
import type { NextApiResponse } from 'next'

export async function convertHTMLToPDF(htmlString: string) {
    const fileBuffer: Buffer = await new Promise(function(resolve, reject) {
        HTMLtoPDF.create(htmlString).toBuffer((err, buffer) => {
            console.log(buffer);
            console.log(err);
            resolve(buffer);
        });
    });
    return fileBuffer
}

export async function convertHTMLToWord(htmlString: string) {
    const fileBuffer: Buffer = await HTMLtoDOCX(htmlString, null, {
        table: { row: { cantSplit: true } },
        //footer: true,
        //pageNumber: true,
    }, null);
    return fileBuffer
}

export async function verifyPassword (password: string, res: NextApiResponse) {
    if (password != process.env.ADMIN_PASSWORD) {
        res.status(UNAUTHORISED_ERROR_CODE).json({ message: 'Incorrect password!' });
        return false
    }
    return true
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
