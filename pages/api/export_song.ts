import type { NextApiRequest, NextApiResponse } from 'next'
import { INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../lib/status_codes'
import { get_song, convertHTMLToWord } from '../../lib/db'
import { convertSongToPPTX, convertPPTXtoFileBuffer } from '../../lib/powerpoint'

async function export_song({exportType, id}:{exportType: string, id: number}) {
    const song = await get_song(id);
    if (song?.lyrics) {
        let fileBuffer: Buffer;
        if (exportType == 'ppt') {
            const slides = await convertSongToPPTX(song.title, song.artist ? song.artist: '', song.lyrics);
            fileBuffer = (await convertPPTXtoFileBuffer(slides)) as Buffer;
        }
        else if (exportType == 'word') {
            fileBuffer = await convertHTMLToWord(song.lyrics);
        }
        // else if (exportType == 'pdf') {
        //     fileBuffer = await convertHTMLToPDF(song.lyrics);
        // }
        else {
            throw Error("Unknown export type");
        }
        return fileBuffer
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "POST":
            try {   
                console.log("\n---EXPORT SONG---");
                console.log("Request body: ");
                console.log(req.body);
                const file_buffer = await export_song(JSON.parse(req.body));
                //console.log("Buffer: ", file_buffer);
                res.write(file_buffer, 'binary');
                res.end(null, 'binary');
                console.log('Exported song successfully!');
            } catch(e) {
                console.error("Request error", e);
                res.status(INTERNAL_SERVER_ERROR_ERROR_CODE).json({ message: 'Failed to export song!' });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(NOT_ALLOWED_ERROR_CODE).end(`Method ${method} Not Allowed`);
            break;
    }
}