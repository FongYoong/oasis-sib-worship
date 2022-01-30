import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
//import Parse from 'parse/node'

// import { createWorker } from 'tesseract.js';

// async function ocr({image}) {
//     console.log(image)
//     const worker = createWorker({
//         logger: m => console.log(m)
//       });
//     await worker.load();
//     await worker.loadLanguage('eng');
//     await worker.initialize('eng');
//     const { data: { text } } = await worker.recognize(image);
//     await worker.terminate();
//     return text
// }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    const { method } = req;
    switch (method) {
        case "POST":
            res.status(200);
            try {
                console.log("\n---OCR---");
                console.log("Request body: ");
                console.log(req.body)
                const body = {
                    something: '123',
                    image: req.body.image
                };
                //console.log(body);
                const ocr_text = (await axios.post(`${process.env.AZURE_API_DOMAIN}/ocrHTTPTrigger?code=${process.env.AZURE_OCR_API_KEY}`, body)).data;
                console.log('Success:');
                console.log(ocr_text);
                res.status(200).json(JSON.stringify(ocr_text));
            } catch (e) {
                console.error("Request error");
                console.log(e)
                res.status(500).json({ error: "Error OCR" });
            }
            break;
        default:
            res.setHeader("Allow", ["GET"]);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
}