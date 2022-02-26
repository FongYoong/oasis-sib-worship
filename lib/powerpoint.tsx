import parse,{ Node, DOMNode, Element as ReactParserElement, Text as ReactParserText } from 'html-react-parser';
import { FaLessThanEqual } from 'react-icons/fa';
//import { Node, DataNode } from 'domhandler';
import {
  Presentation, Slide, Text,
  Shape, render as pptxRender
} from "react-pptx";

export interface PPTSettings {
  overlayHeight: number
  fontFace: string
  fontSize: number
  bold: boolean
}

export const defaultPPTSettings = {
  overlayHeight: 1.4,
  fontFace: 'Trebuchet MS',
  fontSize: 36,
  bold: false,
}

export const defaultGreenBackground = "#00FF00";
export const defaultOverlayBackground = "rgba(0, 0, 0, 0.5)";

export const webSafeFonts = ["Arial", "Verdana ", "Helvetica", "Tahoma", "Trebuchet MS", "Times New Roman", "Georgia", "Garamond", "Courier New", "Brush Script MT"];
// https://blog.hubspot.com/website/web-safe-html-css-fonts
// LEMON MILK

export const TitleSlide = (title: string, artist: string) => {
  return (
    <Slide style={{ backgroundColor: defaultGreenBackground }} >
      <Shape
        type="rect"
        style={{
          x: 0, y: 0, w: 10, h: 1.4,
          backgroundColor: defaultOverlayBackground
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
    fontFace=defaultPPTSettings['fontFace'],
    fontSize=defaultPPTSettings['fontSize'],
    bold=defaultPPTSettings['bold']) => {
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
          backgroundColor: defaultOverlayBackground
        }}
      />
      <Text style={{
        color: 'white',
        align: 'center',
        verticalAlign: 'middle',
        x: 0, y: 0, w: 10, h: overlayHeight,
        fontFace,
        fontSize,
        bold
      }}>
        {text.toUpperCase()}
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
          backgroundColor: defaultOverlayBackground
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

export async function convertSongToPPTX(title: string, artist: string, lyrics: string, pptSettings: (PPTSettings | undefined)) {
  const slides = [BlankSlide(), TitleSlide(title, artist)];
  let slideType : "Section" | "Normal" = "Normal";
  let normalTextTemp: string[] = [];

  const processNormalText = () => {
    if (normalTextTemp.length > 0) {
      let index = 0;
      while(true) {
        let text: string;
        if (index >= normalTextTemp.length - 1) {
          text = normalTextTemp[index];
        }
        else {
          if ((normalTextTemp[index].length <= 27) && (normalTextTemp[index + 1].length <= 27)) {
            text = normalTextTemp[index] + '\n' + normalTextTemp[index + 1];
            index += 1;
          }
          else {
            text = normalTextTemp[index];
          }
        }
        let normalSlide;
        if (pptSettings) {
          normalSlide = NormalSlide(text, pptSettings['overlayHeight'], pptSettings['fontFace'], pptSettings['fontSize'], pptSettings['bold'])
        }
        else {
          normalSlide = NormalSlide(text);
        }
        slides.push(normalSlide);
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