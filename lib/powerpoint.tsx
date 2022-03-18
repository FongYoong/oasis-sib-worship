import parse,{ Node, DOMNode, Element as ReactParserElement, Text as ReactParserText } from 'html-react-parser';
//import { Node, DataNode } from 'domhandler';
import {
  Presentation, Slide, Text,
  Shape, render as pptxRender
} from "react-pptx";
import { rgbaAlphaToHex } from './utils'

export const defaultGreenBackground = "#00FF00";
export const defaultFonts = ["LEMON MILK", "Arial", "Verdana ", "Helvetica", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Garamond", "Courier New", "Brush Script MT"];
// https://blog.hubspot.com/website/web-safe-html-css-fonts
// LEMON MILK

export interface PPTSettings {
  overlayHeight: number
  overlayColor: string // hex // #rrggbb
  overlayAlpha: number
  fontFace: string
  fontSize: number
  fontCharacterSpacing: number
  bold: boolean
  uppercase: boolean
  lineThreshold: number
}

export const defaultPPTSettings: PPTSettings = {
  overlayHeight: 1.4,
  overlayColor: "#000000",
  overlayAlpha: 0.5,
  fontFace: 'Trebuchet MS',
  fontSize: 36,
  fontCharacterSpacing: 0,
  bold: false,
  uppercase: true,
  lineThreshold: 37
}

export const TitleSlide = (title: string, artist: string) => {
  return (
    <Slide style={{ backgroundColor: defaultGreenBackground }} >
      <Shape
        type="rect"
        style={{
          x: 0, y: 0, w: 10, h: 1.4,
          backgroundColor: defaultPPTSettings['overlayColor'] + rgbaAlphaToHex(defaultPPTSettings['overlayAlpha'])
        }}
      />
      <Text style={{
        color: 'white',
        align: 'center',
        verticalAlign: 'middle',
        x: 0, y: 0, w: 10, h: 0.8,
        fontFace: defaultPPTSettings['fontFace'],
        fontSize: 36, bold: true
      }}>
        {title.toUpperCase()}
      </Text>
      <Text style={{
        color: 'white',
        align: 'center',
        verticalAlign: 'middle',
        x: 0, y: 0.6, w: 10, h: 0.8,
        fontFace: defaultPPTSettings['fontFace'],
        fontSize: 24, bold: false, italic:true
      }}>
        {artist.toUpperCase()}
      </Text>
    </Slide>
  )
}

export const BlankSlide = () => {
  return (
    <Slide style={{ backgroundColor: defaultGreenBackground }} >
    </Slide>
  )
}

export const NormalSlide = (text: string,
    overlayHeight=defaultPPTSettings['overlayHeight'],
    overlayColor=defaultPPTSettings['overlayColor'],
    overlayAlpha=defaultPPTSettings['overlayAlpha'],
    fontFace=defaultPPTSettings['fontFace'],
    fontSize=defaultPPTSettings['fontSize'],
    fontCharacterSpacing=defaultPPTSettings['fontCharacterSpacing'],
    bold=defaultPPTSettings['bold'],
    uppercase=defaultPPTSettings['uppercase'],
  ) => {
  // Default aspect ratio is 16:9
  // Max width is 10
  // Max height is 5.625
  // Font face should be a web-safe one
  // Font size measured in pt or point
  return (
    <Slide style={{ backgroundColor: defaultGreenBackground }} >
      <Shape
        type="rect"
        style={{
          x: 0, y: 0, w: 10, h: overlayHeight,
          backgroundColor: overlayColor + rgbaAlphaToHex(overlayAlpha)
        }}
      />
      <Text style={{
        color: 'white',
        align: 'center',
        verticalAlign: 'middle',
        x: 0, y: 0, w: 10, h: overlayHeight,
        fontFace,
        fontSize,
        charSpacing: fontCharacterSpacing,
        bold,
      }}>
        { uppercase ? text.toUpperCase() : text }
      </Text>
    </Slide>
  )
}

export const SectionSlide = (text: string) => {
  return (
    <Slide style={{ backgroundColor: "#FFC000" }} >
      <Shape
        type="rect"
        style={{
          x: 0, y: 3.8, w: 10, h: 1.4,
          backgroundColor: defaultPPTSettings['overlayColor'] + rgbaAlphaToHex(defaultPPTSettings['overlayAlpha'])
        }}
      />
      <Text style={{
        color: 'white',
        align: 'center',
        verticalAlign: 'middle',
        x: 0, y: 3.8, w: 10, h: 1.4,
        fontFace: defaultPPTSettings['fontFace'],
        fontSize: 36, bold: false
      }}>
        {text.toUpperCase()}
      </Text>
    </Slide>
  )
}

export const getTextFromNodes = (nodes: Node[]) => {
  const concatString: string =  nodes.map((node) => {
    if (node.constructor.name == 'Text' && "nodeValue" in node) {
      return (node as ReactParserText).data;
    }
    else {
      return getTextFromNodes((node as ReactParserElement).children);
    }
  }).join('');
  return concatString;
}

//const maxCharactersInALine = 37; // 27

export async function convertSongToPPTX(title: string, artist: string, lyrics: string, pptSettings: (PPTSettings | undefined)) {
  const slides = [BlankSlide(), TitleSlide(title, artist)];
  let slideType : "Section" | "Normal" = "Normal";
  let normalTextTemp: string[] = [];

  const lineThreshold = pptSettings ? pptSettings['lineThreshold'] : defaultPPTSettings['lineThreshold'];

  const processNormalText = () => {
    if (normalTextTemp.length > 0) {
      let index = 0;
      while(true) {
        let text: string;
        if (index >= normalTextTemp.length - 1) {
          text = normalTextTemp[index];
        }
        else {
          if ((normalTextTemp[index].length <= lineThreshold)
            && (normalTextTemp[index + 1].length <= lineThreshold)
            && (normalTextTemp[index].trim() != '')
            && (normalTextTemp[index + 1].trim() != '')) {
            text = normalTextTemp[index].trim() + '\n' + normalTextTemp[index + 1].trim();
            index += 1;
          }
          else {
            text = normalTextTemp[index].trim();
          }
        }
        if (text.length > 0) {
          let normalSlide;
          if (pptSettings) {
            normalSlide = NormalSlide(text, pptSettings['overlayHeight'], pptSettings['overlayColor'], pptSettings['overlayAlpha'],
                                            pptSettings['fontFace'], pptSettings['fontSize'], pptSettings['fontCharacterSpacing'], pptSettings['bold'], pptSettings['uppercase'])
          }
          else {
            normalSlide = NormalSlide(text);
          }
          slides.push(normalSlide);
        }
        index += 1;
        if (index >= normalTextTemp.length) {
          break;
        }
      }
    }
  }

  const parseOptions = {
      replace: (domNode: DOMNode) => {
        if (!domNode.parent) {
          if (domNode.constructor.name == 'Element') {
              const node = domNode as ReactParserElement;
              if (['h1', 'h2', 'h3'].includes(node.name)) {
                if (slideType == 'Normal') {
                  processNormalText();
                  normalTextTemp = [];
                }
                slideType = "Section";
                const text = getTextFromNodes(node.children);
                slides.push(SectionSlide(text));
              }
              else {
                slideType = "Normal";
                const text = getTextFromNodes(node.children);
                normalTextTemp.push(text);
              }
          }
        }
      }
  };
  parse(lyrics, parseOptions);
  processNormalText(); // Add normal slides for remaining text
  return slides;
}

export async function convertPPTXtoFileBuffer(slides: JSX.Element[]) {
  const fileBuffer = await pptxRender(
    <Presentation>
      {slides.map((slide) => slide)}
    </Presentation>
  );
  return fileBuffer;
}