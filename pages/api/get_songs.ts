import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

async function get_all_songs({lastSongId, ...props}: {lastSongId: string}) {
    const last_song_id_int = parseInt(lastSongId);
    console.log("Last song id: " + last_song_id_int);
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
        ...props
    });
    return all_songs;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise<void>((resolve, reject) => {
        console.log(req.query);
        console.log("\n---ALL SONGS---");
        console.log("Request body: ");
        console.log(req.body);
        get_all_songs(JSON.parse(req.body)).then((all_songs) => {
            console.log('success');
            console.log(all_songs)
            res.status(200).json(JSON.stringify(all_songs))
            resolve();
        }).catch((error) => {
            res.json(error);
            res.status(405).end();
            //res.status(204).json({ message: 'No songs in database.' })
        });
    });
}