import type { NextApiRequest, NextApiResponse } from 'next'
import { convertStringToIds } from '../../../lib/utils'
import { get_song, get_multiple_songs } from '../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { song_id, multiple } = req.query;
    switch (method) {
        case "GET":
            try {   
                console.log("\n---GET SONG---");
                console.log("Request query: ");
                console.log(req.query);
                let result;
                if (multiple != undefined) {
                    console.log("---MULTIPLE SONGS---")
                    result = await get_multiple_songs(convertStringToIds(song_id as string));
                }
                else {
                    result = await get_song(parseInt(song_id as string));
                }
                console.log('Success"');
                console.log(result);
                res.status(200).json(JSON.stringify(result))
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