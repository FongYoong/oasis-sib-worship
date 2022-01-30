import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

async function delete_session({id}:{id: number}) {
    const result = await prisma.session.delete({
        where: {
            id: id,
        },
    });
    return result;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "POST":
            try {   
                console.log("\n---DELETE SESSION---");
                console.log("Request body: ");
                console.log(req.body);
                if (req.body.password != process.env.ADMIN_PASSWORD) {
                    res.status(403).json({ message: 'Incorrect password!' });
                }
                const response = await delete_session(JSON.parse(req.body));
                console.log('Success"');
                console.log(response);
                res.status(201).json({ message: 'Deleted session successfully!' });
            } catch(e) {
                console.error("Request error", e);
                res.status(500).json({ message: 'Failed to delete session!' });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}