import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'
import { SUCCESS_CODE, INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../lib/status_codes'

const MAX_ITEMS_PER_PAGE = 10;

async function get_total_pages(config: object) {
    const total_songs = await prisma.song.count(config);
    return Math.ceil(total_songs / MAX_ITEMS_PER_PAGE);
}

async function get_all_songs({page='', searchText='', sortColumn='', sortType=''}: {page?: string, searchText?: string, sortColumn?: string, sortType?: string}) {
    const orderBy = sortColumn && sortType ? {
        [sortColumn] : sortType
    }: {};
    const config = {
        where: {
            OR: [
                {
                    title: {
                        contains: searchText,
                    }
                },
                {
                    artist: {
                        contains: searchText,
                    }
                }
            ],
        }
    }
    const totalPages = await get_total_pages(config);
    let pageConfig = {};
    if (page && totalPages > 0) {
        let pageIndex = parseInt(page);
        pageIndex = (pageIndex > totalPages) ? (totalPages - 1) : pageIndex - 1;
        console.log("Page index: " + pageIndex);
        pageConfig = {
            skip: pageIndex * MAX_ITEMS_PER_PAGE,
            take: MAX_ITEMS_PER_PAGE,
        }
    }

    const all_songs = await prisma.song.findMany({
        ...config,
        ...pageConfig,
        select: {
            id: true,
            updatedAt: true,
            title: true,
            artist: true
        },
        orderBy
    });
    return {
        totalPages,
        all_songs
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "GET":
            try {
                console.log("\n---ALL SONGS---");
                console.log("Request query: ");
                console.log(req.query);
                const { totalPages, all_songs } = await get_all_songs(req.query);
                console.log('Success:');
                res.status(SUCCESS_CODE).json(JSON.stringify({
                    maxItemsPerPage: MAX_ITEMS_PER_PAGE,
                    totalPages,
                    songs: all_songs
                }));
            } catch(e) {
                console.error("Request error", e);
                res.status(INTERNAL_SERVER_ERROR_ERROR_CODE).json({ error: "Error getting songs" });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(NOT_ALLOWED_ERROR_CODE).end(`Method ${method} Not Allowed`);
            break;
    }
}