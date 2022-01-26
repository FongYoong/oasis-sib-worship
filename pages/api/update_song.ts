import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

async function update_song({id, title, artist, lyrics}:{id: number, title: string, artist: string, lyrics: string}) {
    const result = await prisma.song.update({
        where: {
            id: id,
        },
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
        console.log("\n--UPDATE SONG---");
        console.log("Request body: ");
        console.log(req.body);
        update_song(JSON.parse(req.body)).then(() => {
            console.log('success');
            res.status(200).json({ message: 'Updated song successfully!' });
            resolve();
        }).catch((error) => {
            console.log(error);
            res.status(405).json({ message: 'Failed to update song!' });
        });
    });
}