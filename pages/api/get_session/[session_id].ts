import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { convertStringToIds } from '../../../lib/utils'

async function get_session(session_id: number) {
    const song = await prisma.session.findFirst({
        where: {
            id: session_id,
        }
    });
    return song;
}

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
                res.status(200).json(JSON.stringify(sessionWithSongIDs))
            } catch(e) {
                console.error("Request error", e);
                res.status(500).json({ message: 'Failed to get session!' });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}