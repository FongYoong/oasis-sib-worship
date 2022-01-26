import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

async function delete_song({id}:{id: number}) {
    const result = await prisma.song.delete({
        where: {
            id: id,
        },
    });
    return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return new Promise<void>((resolve, reject) => {
        console.log("\n--DELETE SONG---");
        console.log("Request body: ");
        console.log(req.body);
        delete_song(JSON.parse(req.body)).then(() => {
            console.log('success');
            res.status(200).json({ message: 'Deleted song successfully!' });
            resolve();
        }).catch((error) => {
            console.log(error);
            res.status(405).json({ message: 'Failed to delete song!' });
        });
    });
}