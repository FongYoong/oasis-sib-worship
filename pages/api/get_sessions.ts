import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { convertStringToIds } from '../../lib/utils'

async function get_all_sessions({lastSessionId='0', searchText='', sortColumn='date', sortType='desc'}: {lastSessionId?: string, searchText?: string, sortColumn?: string, sortType?: string}) {
    const last_session_id_int = parseInt(lastSessionId);
    console.log("Last session id: " + last_session_id_int);
    const orderBy = sortColumn && sortType ? {
        [sortColumn] : sortType
    }: {};
    const all_sessions = await prisma.session.findMany({
        //take: 4,
        //skip: 1, // Skip the cursor
        //cursor: {
        //    id: last_session_id_int + 1,
        //},
        select: {
            id: true,
            date: true,
            songs: true,
            worship_leader: true
        },
        orderBy,
        where: {
            OR: [
                // {
                //   songs: {
                //     contains: searchText,
                //   },
                // },
                // date: {
                //      contains: searchText,
                // }
                {
                  worship_leader: {
                    contains: searchText,
                  },
                }
            ],
        }
    });
    return all_sessions;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "GET":
            try {   
                console.log("\n---ALL SESSIONS---");
                console.log("Request query: ");
                console.log(req.query);
                const all_sessions = await get_all_sessions(req.query);
                const all_sessionsWithSongIDs = all_sessions.map((session) => {
                    return {
                        ...session,
                        songs: convertStringToIds(session.songs)
                    }
                });
                console.log('Success:');
                console.log(all_sessionsWithSongIDs);
                res.status(200).json(JSON.stringify(all_sessionsWithSongIDs));
            } catch(e) {
                console.error("Request error", e);
                res.status(500).json({ error: "Error getting sessions" });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}