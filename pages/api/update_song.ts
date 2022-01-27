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
    const { method } = req;
    switch (method) {
        case "POST":
            try {   
                console.log("\n---UPDATE SONG---");
                console.log("Request body: ");
                console.log(req.body);
                const response = await update_song(JSON.parse(req.body));
                console.log('Success"');
                console.log(response);
                res.status(200).json({ message: 'Updated song successfully!' });
            } catch(e) {
                console.error("Request error", e);
                res.status(500).json({ message: 'Failed to update song!' });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}