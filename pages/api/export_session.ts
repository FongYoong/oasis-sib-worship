import type { NextApiRequest, NextApiResponse } from 'next'
import { mergeSessiontoHTML } from '../../lib/utils';
import { get_session, get_multiple_songs, convertHTMLToWord } from '../../lib/db'
import { SectionSlide, convertSongToPPTX, convertPPTXtoFileBuffer } from '../../lib/powerpoint'
import { SessionProps, SongProps } from '../../lib/types';

async function export_session({exportType, id, song_ids}:{exportType: string, id: number, song_ids: number[]}) {
    const session = await get_session(id);
    if (session?.date) {
        session.date = new Date(session.date);
    }
    const songArray = await get_multiple_songs(song_ids);
    if (exportType == 'ppt') {
        let allSlides: JSX.Element[] = [SectionSlide(`${session?.date.toDateString()} - ${session?.worship_leader}`)]
        for (const song of songArray) {
            if (song?.lyrics) {
                const slides = await convertSongToPPTX(song.title, song.artist ? song.artist: '', song.lyrics);
                allSlides = allSlides.concat(slides);
            }
        }
        const fileBuffer = (await convertPPTXtoFileBuffer(allSlides)) as Buffer;
        return fileBuffer;
    }
    else if (exportType == 'word') {
        const mergedHTML = mergeSessiontoHTML(session as unknown as SessionProps, songArray as unknown as SongProps[]);
        const fileBuffer = await convertHTMLToWord(mergedHTML);
        return fileBuffer
    }
    else {
        throw Error("Unknown export type");
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "POST":
            try {   
                console.log("\n---EXPORT SESSION---");
                console.log("Request body: ");
                console.log(req.body);
                const file_buffer = await export_session(JSON.parse(req.body));
                console.log(file_buffer);
                res.write(file_buffer, 'binary');
                res.end(null, 'binary');
                console.log('Exported song successfully!');
            } catch(e) {
                console.error("Request error", e);
                res.status(500).json({ message: 'Failed to export session!' });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}