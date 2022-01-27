import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

async function get_all_songs({lastSongId='0', searchText='', sortColumn='', sortType=''}: {lastSongId?: string, searchText?: string, sortColumn?: string, sortType?: string}) {
    const last_song_id_int = parseInt(lastSongId);
    console.log("Last song id: " + last_song_id_int);
    const orderBy = sortColumn && sortType ? {
        [sortColumn] : sortType
    }: {};
    const all_songs = await prisma.song.findMany({
        //take: 4,
        //skip: 1, // Skip the cursor
        //cursor: {
        //    id: last_song_id_int + 1,
        //},
        select: {
            id: true,
            updatedAt: true,
            title: true,
            artist: true
        },
        orderBy,
        where: {
            OR: [
                {
                  title: {
                    contains: searchText,
                  },
                },
                {
                  artist: {
                    contains: searchText,
                  },
                }
            ],
        }
    });
    return all_songs;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "GET":
            try {
                console.log("\n---ALL SONGS---");
                console.log("Request query: ");
                console.log(req.query);
                const all_songs = await get_all_songs(req.query);
                console.log('Success:');
                console.log(all_songs);
                res.status(200).json(JSON.stringify(all_songs));
            } catch(e) {
                console.error("Request error", e);
                res.status(500).json({ error: "Error getting songs" });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}