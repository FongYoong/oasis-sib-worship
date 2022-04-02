import type { NextApiRequest, NextApiResponse } from 'next'
import { SUCCESS_CODE, INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../../lib/status_codes'
import { getLyrics, getSong } from 'genius-lyrics-api';

async function getSongFromGenius({title, artist}: {title: string, artist: string}) {
    const options = {
        apiKey: process.env.GENIUS_ACCESS_TOKEN,
        title,
        artist,
        optimizeQuery: true
    };
    const song = await getSong(options);
    return song;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "POST":
            try {
                console.log("\n---GET GENIUS SONG---");
                console.log("Request body: ");
                const body = JSON.parse(req.body);
                console.log(body);
                const song = await getSongFromGenius(body);
                console.log('Success:');
                res.status(SUCCESS_CODE).json(JSON.stringify({
                    song
                }));
            } catch(e) {
                console.error("Request error", e);
                res.status(INTERNAL_SERVER_ERROR_ERROR_CODE).json({ error: "Error getting songs" });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(NOT_ALLOWED_ERROR_CODE).end(`Method ${method} Not Allowed`);
            break;
    }
}