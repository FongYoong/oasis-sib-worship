/* eslint-disable jsx-a11y/alt-text */
import { UNAUTHORISED_ERROR_CODE } from './status_codes'
import prisma from './prisma'
import HTMLtoPDF from 'pdf-puppeteer'
import HTMLtoDOCX from 'html-to-docx'
import type { NextApiResponse } from 'next'
import chromium from 'chrome-aws-lambda'
import playwright from "playwright-core";

(async () => {
    const browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    await browser.close();
})();

export async function convertHTMLToPDF(htmlString: string) {
    const margin = 40;
    const executablePath = await chromium.executablePath;
    const fileBuffer: Buffer = await new Promise(function(resolve, reject) {
        HTMLtoPDF(htmlString, (pdf) => {
            resolve(pdf)
        },
        {
            margin: {
                top: margin,
                right: margin,
                bottom: margin,
                left: margin
            }
        },
        {
            executablePath: executablePath
        }
        );
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
