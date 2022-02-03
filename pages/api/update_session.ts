import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { SUCCESS_CODE, INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../lib/status_codes'

async function update_session({id, date, songs, worship_leader, vocalist, keyboard, guitar, drums, sound_personnel, info}:
    {id: number, date: string, songs: string, worship_leader: string, vocalist?: string, keyboard?: string, guitar?: string, drums?: string, sound_personnel?: string, info?: string}) {
    const result = await prisma.session.update({
        where: {
            id: id,
        },
        data: {
            date,
            songs,
            worship_leader,
            vocalist,
            keyboard,
            guitar,
            drums,
            sound_personnel,
            info
        },
    });
    return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "POST":
            try {   
                console.log("\n---UPDATE SESSION---");
                console.log("Request body: ");
                console.log(req.body);
                const response = await update_session(JSON.parse(req.body));
                console.log('Success"');
                console.log(response);
                res.status(SUCCESS_CODE).json({ message: 'Updated session successfully!' });
            } catch(e) {
                console.error("Request error", e);
                res.status(INTERNAL_SERVER_ERROR_ERROR_CODE).json({ message: 'Failed to update session!' });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(NOT_ALLOWED_ERROR_CODE).end(`Method ${method} Not Allowed`);
            break;
    }
}