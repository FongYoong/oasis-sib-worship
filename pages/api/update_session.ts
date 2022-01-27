import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

async function update_session({id, date, songs, worship_leader, vocalist, keyboard, guitar, drums, sound_personnel}:
    {id: number, date: string, songs: string, worship_leader: string, vocalist?: string, keyboard?: string, guitar?: string, drums?: string, sound_personnel?: string}) {
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
                console.log("\n---UPDATE SESSION---");
                console.log("Request body: ");
                console.log(req.body);
                const response = await update_session(JSON.parse(req.body));
                console.log('Success"');
                console.log(response);
                res.status(200).json({ message: 'Updated session successfully!' });
            } catch(e) {
                console.error("Request error", e);
                res.status(500).json({ message: 'Failed to update session!' });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}