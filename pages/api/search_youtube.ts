import type { NextApiRequest, NextApiResponse } from 'next'
import YouTubeSearch from 'youtube-search-api'
import { SUCCESS_CODE, BAD_REQUEST_ERROR_CODE, INTERNAL_SERVER_ERROR_ERROR_CODE, NOT_ALLOWED_ERROR_CODE } from '../../lib/status_codes'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "GET":
            try {
                console.log("\n---SEARCH YOUTUBE---");
                console.log("Request query: ");
                console.log(req.query);
                if (req.query.keyword) {
                    const result = await YouTubeSearch.GetListByKeyword(req.query.keyword);
                    //console.log('Success:');
                    //console.log(result);
                    res.status(SUCCESS_CODE).json(JSON.stringify(result.items[0].id));
                }
                else {
                    res.status(BAD_REQUEST_ERROR_CODE).json({ error: "No keyword supplied" });
                }
            } catch(e) {
                console.error("Request error", e);
                res.status(INTERNAL_SERVER_ERROR_ERROR_CODE).json({ error: "Error searching YouTube" });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(NOT_ALLOWED_ERROR_CODE).end(`Method ${method} Not Allowed`);
            break;
    }
}