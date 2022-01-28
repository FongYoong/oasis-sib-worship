import type { NextApiRequest, NextApiResponse } from 'next'
import { get_song } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { song_id } = req.query;
    switch (method) {
        case "GET":
            try {   
                console.log("\n---GET SONG---");
                console.log("Request query: ");
                console.log(req.query);
                const song = await get_song(parseInt(song_id as string));
                console.log('Success"');
                console.log(song);
                res.status(200).json(JSON.stringify(song))
            } catch(e) {
                console.error("Request error", e);
                res.status(500).json({ message: 'Failed to get song!' });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}