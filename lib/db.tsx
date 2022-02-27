/* eslint-disable jsx-a11y/alt-text */
import { UNAUTHORISED_ERROR_CODE } from './status_codes'
import prisma from './prisma'
import HTMLtoDOCX from 'html-to-docx'
import type { NextApiResponse } from 'next'

import os from "os"
import path from "path"
import { execSync } from 'child_process'
import fs from "fs"
const tempDir = os.tmpdir();

// export async function convertHTMLToPDF(htmlString: string) {
//     const body = {
//         htmlCode: htmlString
//     }
//     //const data = (await axios.post(`${process.env.AZURE_API_DOMAIN}/htmlToPDFHTTPTrigger?code=${process.env.AZURE_HTML_TO_PDF_API_KEY}`, body)).data;
//     const data = (await axios.post(`https://api.sejda.com/v2/html-pdf`,
//         body, {
//             headers: {
//                 'Authorization': `Token: ${process.env.SEDJA_PDF_API_KEY}`
//             },
//         })).data;
//     console.log(data)
//     const fileBuffer: Buffer = Buffer.from(data);
//     fs.writeFileSync('C:/Users/ACER NITRO5/Desktop/oasis-sib-worship/out2.pdf', fileBuffer);
//     return fileBuffer
// }

export async function convertHTMLToPDF(htmlString: string) {
    const outputFilePath = path.join(tempDir, 'output.pdf');
    if (process.platform === "win32") {
        const executablePath = path.join(process.cwd(), 'wkhtmltopdf', 'wkhtmltopdf.exe');
        const processOutput = execSync(`"${executablePath}" -d 300 - ${outputFilePath}`, { input: htmlString });
        console.log(processOutput);
    }
    else if (process.platform === "linux") {
        const processOutput = execSync(`wkhtmltopdf -d 300 - ${outputFilePath}`, { input: htmlString });
        console.log(processOutput);
    }
    else {
        throw `${process.platform} is not a supported platform.`;
    }
    const fileBuffer: Buffer = fs.readFileSync(outputFilePath);
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
    const orderedSongs = song_ids.map((id) => songs.find((song) => song.id == id));
    return orderedSongs;
}

export async function get_session(session_id: number) {
    const song = await prisma.session.findFirst({
        where: {
            id: session_id,
        }
    });
    return song;
}
