import type { NextApiRequest, NextApiResponse } from 'next'
import { SUCCESS_CODE, INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../../lib/status_codes'
import { get_session } from '../../../lib/db'
import { convertStringToIds } from '../../../lib/utils'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { session_id } = req.query;
    switch (method) {
        case "GET":
            try {   
                console.log("\n---GET SESSION---");
                console.log("Request query: ");
                console.log(req.query);
                const session = await get_session(parseInt(session_id as string));
                const sessionWithSongIDs = session ? {
                    ...session,
                    songs: convertStringToIds(session.songs)
                } : null;
                console.log('Success"');
                console.log(sessionWithSongIDs);
                res.status(SUCCESS_CODE).json(JSON.stringify(sessionWithSongIDs))
            } catch(e) {
                console.error("Request error", e);
                res.status(INTERNAL_SERVER_ERROR_ERROR_CODE).json({ message: 'Failed to get session!' });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(NOT_ALLOWED_ERROR_CODE).end(`Method ${method} Not Allowed`);
            break;
    }
}