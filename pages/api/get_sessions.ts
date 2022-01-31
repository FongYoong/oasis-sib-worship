import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { SUCCESS_CODE, INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../lib/status_codes'
import { convertStringToIds, isInvalidDate } from '../../lib/utils'

const MAX_ITEMS_PER_PAGE = 5;

async function get_total_pages(config: object) {
    const total_sessions = await prisma.session.count(config);
    return Math.ceil(total_sessions / MAX_ITEMS_PER_PAGE);
}

async function get_all_sessions({page='', searchText='', startDate='', endDate='', sortColumn='date', sortType='desc'}:
                                {page?: string, searchText?: string, startDate?: string, endDate?: string, sortColumn?: string, sortType?: string}) {
    const orderBy = sortColumn && sortType ? {
        [sortColumn] : sortType
    }: {};
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    console.log(startDateObj)
    console.log(endDateObj)
    let dateConfig = {}
    if (!isInvalidDate(startDateObj) && !isInvalidDate(endDateObj)) {
        dateConfig = {
            date: {
                lte: endDateObj,
                gte: startDateObj,
            }
        }
    }
    const config = {
        where: {
            AND: [
                {
                    ...dateConfig
                },
                {
                    worship_leader: {
                        contains: searchText,
                    }
                }
            ],
        }
    };
    const totalPages = await get_total_pages(config);
    let pageConfig = {};
    if (page && totalPages > 0) {
        let pageIndex = parseInt(page);
        pageIndex = (pageIndex > totalPages) ? (totalPages - 1) : pageIndex - 1;
        pageConfig = {
            skip: pageIndex * MAX_ITEMS_PER_PAGE,
            take: MAX_ITEMS_PER_PAGE,
        }
    }

    const all_sessions = await prisma.session.findMany({
        ...config,
        ...pageConfig,
        select: {
            id: true,
            date: true,
            songs: true,
            worship_leader: true
        },
        orderBy
    });
    return {
        totalPages,
        all_sessions
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "GET":
            try {   
                console.log("\n---ALL SESSIONS---");
                console.log("Request query: ");
                console.log(req.query);
                const { totalPages, all_sessions } = await get_all_sessions(req.query);
                const all_sessionsWithSongIDs = all_sessions.map((session) => {
                    return {
                        ...session,
                        songs: convertStringToIds(session.songs)
                    }
                });
                console.log('Success:');
                console.log(all_sessionsWithSongIDs);
                res.status(SUCCESS_CODE).json(JSON.stringify({
                    maxItemsPerPage: MAX_ITEMS_PER_PAGE,
                    totalPages,
                    sessions: all_sessionsWithSongIDs
                }));
            } catch(e) {
                console.error("Request error", e);
                res.status(INTERNAL_SERVER_ERROR_ERROR_CODE).json({ error: "Error getting sessions" });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(NOT_ALLOWED_ERROR_CODE).end(`Method ${method} Not Allowed`);
            break;
    }
}