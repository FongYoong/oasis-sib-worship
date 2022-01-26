import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

async function get_song(song_id: number) {
    const song = await prisma.song.findFirst({
        where: {
            id: song_id,
        }
    });
    return song;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise<void>((resolve, reject) => {
        const { song_id } = req.query;
        console.log("\n---GET SONG---");
        console.log("Song id: " + song_id);
        get_song(parseInt(song_id as string)).then((song) => {
            console.log('success');
            console.log(song)
            res.status(200).json(JSON.stringify(song))
            resolve();
        }).catch((error) => {
            res.json(error);
            res.status(405).end();
            //res.status(204).json({ message: 'No songs in database.' })
        });
    });
}