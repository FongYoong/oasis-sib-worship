import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { SUCCESS_CODE, INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../lib/status_codes'
import { verifyPassword } from '../../lib/db'

async function delete_session(id: number) {
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
                const body = JSON.parse(req.body);
                if (await verifyPassword(body.password, res)) {
                    const response = await delete_session(body.id);
                    console.log('Success');
                    console.log(response);
                    res.status(SUCCESS_CODE).json({ message: 'Deleted session successfully!' });
                }
            } catch(e) {
                console.error("Request error", e);
                res.status(INTERNAL_SERVER_ERROR_ERROR_CODE).json({ message: 'Failed to delete session!' });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(NOT_ALLOWED_ERROR_CODE).end(`Method ${method} Not Allowed`);
            break;
    }
}