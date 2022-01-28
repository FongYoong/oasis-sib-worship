/* eslint-disable jsx-a11y/alt-text */
import prisma from './prisma'
import {
    Presentation, Slide, Text,
    Shape, Image, render
  } from "react-pptx";
import HTMLtoDOCX from 'html-to-docx'

export async function convertHTMLToPPTX(htmlString: string) {
  const fileBuffer = await render(
      <Presentation>
        <Slide>
          <Text style={{
            x: 3, y: 1, w: 3, h: 0.5,
            fontSize: 32
          }}>
            Hello there!
          </Text>
          <Shape
            type="rect"
            style={{
              x: 3, y: 1.55, w: 3, h: 0.1,
              backgroundColor: "#FF0000"
            }}
          />
        </Slide>
        <Slide>
          <Image
            src={{
              kind: "path",
              path: "http://www.fillmurray.com/460/300"
            }}
            style={{
              x: "10%", y: "10%", w: "80%", h: "80%"
            }}
          />
        </Slide>
      </Presentation>
    );
    return fileBuffer;
      //.then(buffer => {
        //fs.writeFile("presentation.pptx", buffer);
}

export async function convertHTMLToWord(htmlString: string) {
    console.log('docccc')
    console.log(HTMLtoDOCX)
    const fileBuffer: Buffer = await HTMLtoDOCX(htmlString, null, {
        table: { row: { cantSplit: true } },
        //footer: true,
        //pageNumber: true,
    }, null);
    //console.log(fileBuffer)
    return fileBuffer
    // fs.writeFile(filePath, fileBuffer, (error) => {
    //     if (error) {
    //       console.log('Docx file creation failed');
    //       return;
    //     }
    //     console.log('Docx file created successfully');
    // });
}

export async function get_song(song_id: number) {
    const song = await prisma.song.findFirst({
        where: {
            id: song_id,
        }
    });
    return song;
}

