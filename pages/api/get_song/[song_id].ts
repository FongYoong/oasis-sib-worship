import type { NextApiRequest, NextApiResponse } from 'next'
import { SUCCESS_CODE, NOT_FOUND_ERROR_CODE, INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../../lib/status_codes'
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
                if (result == null) {
                    res.status(NOT_FOUND_ERROR_CODE).json({ message: 'Song not found!' });
                    return;
                }
                res.status(SUCCESS_CODE).json(JSON.stringify(result))
            } catch(e) {
                console.error("Request error", e);
                res.status(INTERNAL_SERVER_ERROR_ERROR_CODE).json({ message: 'Failed to get song!' });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(NOT_ALLOWED_ERROR_CODE).end(`Method ${method} Not Allowed`);
            break;
    }
}