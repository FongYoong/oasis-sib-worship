import type { NextApiRequest, NextApiResponse } from 'next'
import YouTubeSearch from 'youtube-search-api'

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
                    console.log('Success:');
                    console.log(result);
                    res.status(200).json(JSON.stringify(result.items[0].id));
                }
                else {
                    res.status(500).json({ error: "No keyword supplied" });
                }
            } catch(e) {
                console.error("Request error", e);
                res.status(500).json({ error: "Error searching YouTube" });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}