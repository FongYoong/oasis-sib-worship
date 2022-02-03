import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { SUCCESS_CODE, INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../lib/status_codes'
import { verifyPassword } from '../../lib/db'

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
                //console.log(req.body);
                const body = JSON.parse(req.body);
                if (await verifyPassword(body.password, res)) {
                    const response = await update_song(body);
                    console.log('Success');
                    console.log(response);
                    res.status(SUCCESS_CODE).json({ message: 'Updated song successfully!' });
                }
            } catch(e) {
                console.error("Request error", e);
                res.status(INTERNAL_SERVER_ERROR_ERROR_CODE).json({ message: 'Failed to update song!' });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(NOT_ALLOWED_ERROR_CODE).end(`Method ${method} Not Allowed`);
            break;
    }
}