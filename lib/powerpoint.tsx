import parse,{ Node, DOMNode, Element as ReactParserElement, Text as ReactParserText } from 'html-react-parser';
//import { Node, DataNode } from 'domhandler';
import {
  Presentation, Slide, Text,
  Shape, render as pptxRender
} from "react-pptx";

const fontFace = "Trebuchet MS"; // https://blog.hubspot.com/website/web-safe-html-css-fonts

const TitleSlide = (title: string, artist: string) => {
  return (
    <Slide style={{ backgroundColor: "#00FF00" }} >
    <Shape
      type="rect"
      style={{
        x: 0, y: 0, w: 10, h: 1.4,
        backgroundColor: "rgba(0, 0, 0, 0.5)"
      }}
    />
    <Text style={{
      color: 'white',
      align: 'center',
      verticalAlign: 'middle',
      x: 0, y: 0, w: 10, h: 0.8,
      fontFace, fontSize: 36, bold: true
    }}>
      {title.toUpperCase()}
    </Text>
    <Text style={{
      color: 'white',
      align: 'center',
      verticalAlign: 'middle',
      x: 0, y: 0.6, w: 10, h: 0.8,
      fontFace, fontSize: 24, bold: false, italic:true
    }}>
      {artist.toUpperCase()}
    </Text>
    </Slide>
  )
}

const NormalSlide = (text: string) => {
  return (
    <Slide style={{ backgroundColor: "#00FF00" }} >
      <Shape
        type="rect"
        style={{
          x: 0, y: 0, w: 10, h: 1.4,
          backgroundColor: "rgba(0, 0, 0, 0.5)"
        }}
      />
      <Text style={{
        color: 'white',
        align: 'center',
        verticalAlign: 'middle',
        x: 0, y: 0, w: 10, h: 1.4,
        fontFace, fontSize: 36, bold: false
      }}>
        {text.toUpperCase()}
      </Text>
    </Slide>
  )
}

const SectionSlide = (text: string) => {
  return (
    <Slide style={{ backgroundColor: "#FFC000" }} >
      <Shape
        type="rect"
        style={{
          x: 0, y: 3.8, w: 10, h: 1.4,
          backgroundColor: "rgba(0, 0, 0, 0.5)"
        }}
      />
      <Text style={{
        color: 'white',
        align: 'center',
        verticalAlign: 'middle',
        x: 0, y: 3.8, w: 10, h: 1.4,
        fontFace, fontSize: 36, bold: false
      }}>
        {text.toUpperCase()}
      </Text>
    </Slide>
  )
}

const getTextFromNodes = (nodes: Node[]) => {
  const concatString: string =  nodes.map((node) => {
    if (node.constructor.name == 'Text' && "nodeValue" in node) {
      return (node as ReactParserText).data;
      //return (node as DataNode).nodeValue
      //const text = node.children[0].type as string;
      //slides.push(NormalSlide(text))
    }
    else {
      return getTextFromNodes((node as ReactParserElement).children);
    }
  }).join('');
  return concatString;
}

export async function convertSongToPPTX(title: string, artist: string, lyrics: string) {
  const slides = [TitleSlide(title, artist)];
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
        slides.push(NormalSlide(text));
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
              //else if (node.name == 'p') {
                  //const props = attributesToProps(node.attribs);
                  //props.style = {
                  //    ...props.style,
                  //    wordSpacing: '0',
                  //}
                  //return <p {...props} > {domToReact(node.children, parseOptions)} </p>;
              else {
                slideType = "Normal";
                const text = getTextFromNodes(node.children);
                normalTextTemp.push(text);
              }
          }
          //else if (domNode.constructor.name == 'Text') {
            //const node = domNode as ReactParserText;
            //const text = node.children[0].type as string;
            //slides.push(NormalSlide(text))
          //}
        }
      }
  };
  parse(lyrics, parseOptions);
  processNormalText(); // Add normal slides for remaining text
  const fileBuffer = await pptxRender(
    <Presentation>
      {slides.map((slide) => slide)}
    </Presentation>
  );
  return fileBuffer;
}