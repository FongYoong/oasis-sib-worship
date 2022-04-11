import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { SUCCESS_CODE, INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../../lib/status_codes'
import { convertStringToIds } from '../../../lib/utils'
import { SessionProps } from '../../../lib/types'

const MAX_SONGS = 20; // Show top 20 songs

// const MAX_ITEMS_PER_PAGE = 10;

// async function get_total_pages(config: object) {
//     const total_songs = await prisma.song.count(config);
//     return Math.ceil(total_songs / MAX_ITEMS_PER_PAGE);
// }

// pagination ?
// search by song and see the number of sessions.
// Can show the sessions which use this song in a calendar or time series or a table.
// Can show count and percentage (among all session)

// 

async function get_top_songs() {
    const allSessions: SessionProps[] = (await prisma.session.findMany({
        select: {
            worship_leader: true,
            date: true,
            songs: true
        },
        orderBy: {
            date: 'desc',
        },
    })).map((session) => {
        return {
            ...session,
            songs: convertStringToIds(session.songs)
        }
    });
    const oldestSessionDate = allSessions[allSessions.length - 1].date;

    const songs: any = { };

    allSessions.forEach((session) => {
        session.songs.forEach((songId) => {
            if (!(songId in songs)) {
                songs[songId] = {
                    dates: [session.date],
                    count: 1
                };
            }
            else {
                songs[songId] = {
                    dates: [...songs[songId].dates, session.date],
                    count: songs[songId].count + 1
                }
            }
        })
    });

    const allSongsData = await prisma.song.findMany({
        where: {
            id: { in: Object.keys(songs).map((id) => parseInt(id)) }
        },
        select: {
            id: true,
            title: true,
            artist: true
        }
    });

    const allSongs = Object.keys(songs).map((songId) => {
        const songData = allSongsData.find((s) => s.id == parseInt(songId));
        return {
            ...songData,
            dates: songs[songId].dates.sort(),
            count: songs[songId].count,
            percent: `${(songs[songId].count / allSessions.length * 100).toFixed(2)}%`
        }
    });

    // const allSongs = await Promise.all(Object.keys(songs).map(async (songId) => {
    //     const songData = await prisma.song.findFirst({
    //         where: {
    //             id: parseInt(songId)
    //         },
    //         select: {
    //             title: true,
    //             artist: true
    //         }
    //     });
    //     return {
    //         songId,
    //         ...songData,
    //         dates: songs[songId].dates.sort(),
    //         count: songs[songId].count
    //     }
    // }));
    

    const orderedSongs = allSongs.sort((a, b) => {
        return b.count - a.count
    })

    //const orderedSongs = console.log(orderedSongs);

    

    // const orderBy = sortColumn && sortType ? {
    //     [sortColumn] : sortType
    // }: {};
    // const config = {
    //     where: {
    //         OR: [
    //             {
    //                 title: {
    //                     contains: searchText,
    //                 }
    //             },
    //             {
    //                 artist: {
    //                     contains: searchText,
    //                 }
    //             }
    //         ],
    //     }
    // }
    // const totalPages = await get_total_pages(config);
    // let pageConfig = {};
    // if (page && totalPages > 0) {
    //     let pageIndex = parseInt(page);
    //     pageIndex = (pageIndex > totalPages) ? (totalPages - 1) : pageIndex - 1;
    //     console.log("Page index: " + pageIndex);
    //     pageConfig = {
    //         skip: pageIndex * MAX_ITEMS_PER_PAGE,
    //         take: MAX_ITEMS_PER_PAGE,
    //     }
    // }

    // const all_songs = await prisma.song.findMany({
    //     ...config,
    //     ...pageConfig,
    //     select: {
    //         id: true,
    //         updatedAt: true,
    //         title: true,
    //         artist: true
    //     },
    //     orderBy
    // });
    return {orderedSongs , oldestSessionDate};
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "GET":
            try {
                console.log("\n---STATS: SONGS---");
                console.log("Request query: ");
                console.log(req.query);
                const {orderedSongs, oldestSessionDate} = await get_top_songs();
                console.log('Success:');
                res.status(SUCCESS_CODE).json(JSON.stringify({
                    orderedSongs,
                    oldestSessionDate
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