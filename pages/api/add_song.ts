import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

async function add_song({title, artist, lyrics}:{title: string, artist: string, lyrics: string}) {
    const result = await prisma.song.create({
        data: {
            title,
            artist,
            lyrics
        },
    });
    return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise<void>((resolve, reject) => {
        console.log("\n--ADD SONG---");
        console.log("Request body: ");
        console.log(req.body);
        add_song(JSON.parse(req.body)).then(() => {
            console.log('success');
            res.status(201).json({ message: 'Added song successfully!' });
            resolve();
        }).catch((error) => {
            console.log(error);
            res.status(405).json({ message: 'Failed to add song!' });
        });
    });
}