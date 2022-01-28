import type { NextApiRequest, NextApiResponse } from 'next'
import { get_song, convertHTMLToWord } from '../../lib/db'

async function export_song({exportType, id}:{exportType: string, id: number}) {
    // const result = await prisma.song.create({
    //     data: {
    //         title,
    //         artist,
    //         lyrics
    //     },
    // });
    const song = await get_song(id);
    if (song?.lyrics) {
        let fileBuffer: Buffer;
        if (exportType == 'pptx') {
            fileBuffer = await convertHTMLToWord(song.lyrics);
        }
        else if (exportType == 'word') {
            fileBuffer = await convertHTMLToWord(song.lyrics);
        }
        else {
            throw Error("Unknown export type");
        }
        return fileBuffer
    }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    switch (method) {
        case "POST":
            try {   
                console.log("\n---EXPORT SONG---");
                console.log("Request body: ");
                console.log(req.body);
                const file_buffer = await export_song(JSON.parse(req.body));
                console.log(file_buffer);
                res.write(file_buffer, 'binary');
                res.end(null, 'binary');
                // res.writeHead(200, {
                //     'Content-Type': 'audio/mpeg',
                //     'Content-Length': stat.size
                // });
                //const readStream = fileSystem.createReadStream(filePath);
                //readStream.pipe(res);
                console.log('Exported song successfully!');
                //res.status(201).json({ message: 'Exported song successfully!' });
            } catch(e) {
                console.error("Request error", e);
                res.status(500).json({ message: 'Failed to export song!' });
            }
            break;
        default:
            res.setHeader("Allow", ["POST"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}