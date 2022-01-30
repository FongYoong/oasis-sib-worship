import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { convertStringToIds } from '../../lib/utils'

const MAX_ITEMS_PER_PAGE = 5;

async function get_total_pages() {
    const total_sessions = await prisma.session.count();
    return Math.ceil(total_sessions / MAX_ITEMS_PER_PAGE);
}

async function get_all_sessions({page='0', searchText='', sortColumn='date', sortType='desc'}: {page?: string, searchText?: string, sortColumn?: string, sortType?: string}, totalPages: number) {
    let pageIndex = parseInt(page);
    pageIndex = (pageIndex > totalPages) ? (totalPages - 1) : pageIndex - 1;
    console.log("Page index: " + pageIndex);
    const orderBy = sortColumn && sortType ? {
        [sortColumn] : sortType
    }: {};
    const all_sessions = await prisma.session.findMany({
        skip: pageIndex * MAX_ITEMS_PER_PAGE,
        take: MAX_ITEMS_PER_PAGE,
        select: {
            id: true,
            date: true,
            songs: true,
            worship_leader: true
        },
        orderBy,
        where: {
            OR: [
                // {
                //   songs: {
                //     contains: searchText,
                //   },
                // },
                // date: {
                //      contains: searchText,
                // }
                {
                  worship_leader: {
                    contains: searchText,
                  },
                }
            ],
        }
    });
    return all_sessions;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "GET":
            try {   
                console.log("\n---ALL SESSIONS---");
                console.log("Request query: ");
                console.log(req.query);
                const totalPages = await get_total_pages();
                const all_sessions = await get_all_sessions(req.query, totalPages);
                const all_sessionsWithSongIDs = all_sessions.map((session) => {
                    return {
                        ...session,
                        songs: convertStringToIds(session.songs)
                    }
                });
                console.log('Success:');
                console.log(all_sessionsWithSongIDs);
                res.status(200).json(JSON.stringify({
                    maxItemsPerPage: MAX_ITEMS_PER_PAGE,
                    totalPages,
                    sessions: all_sessionsWithSongIDs
                }));
            } catch(e) {
                console.error("Request error", e);
                res.status(500).json({ error: "Error getting sessions" });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}