import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { CREATE_SUCCESS_CODE, INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../lib/status_codes'

async function add_session({date, songs, worship_leader, vocalist, keyboard, guitar, drums, sound_personnel}:
    {date: string, songs: string, worship_leader: string, vocalist?: string, keyboard?: string, guitar?: string, drums?: string, sound_personnel?: string}) {
    const result = await prisma.session.create({
        data: {
            date,
            songs,
            worship_leader,
            vocalist,
            keyboard,
            guitar,
            drums,
            sound_personnel
        },
    });
    return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "POST":
            try {
                console.log("\n---ADD SESSION---");
                console.log("Request body: ");
                console.log(req.body);
                const response = await add_session(JSON.parse(req.body));
                console.log('Success"');
                console.log(response);
                res.status(CREATE_SUCCESS_CODE).json({ message: 'Added session successfully!' });
            } catch(e) {
                console.error("Request error", e);
                res.status(INTERNAL_SERVER_ERROR_ERROR_CODE).json({ message: 'Failed to add session!' });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(NOT_ALLOWED_ERROR_CODE).end(`Method ${method} Not Allowed`);
            break;
    }
}