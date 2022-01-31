import { Tag, toaster, Message } from 'rsuite';
import { Element as ReactParserElement, DOMNode, domToReact, attributesToProps  } from 'html-react-parser';
import { SessionProps, SongProps } from './types';

export const isPresentOrFutureDate = (date: Date) => {
    const today = new Date();
    return date.setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0);
};

export const json_fetcher = (method: string, body?: object) => (url: string) => fetch(url, {method: method, body: JSON.stringify(body)}).then(r => r.json());

export const convertStringToIds = (data: string) => {
    const ids = data.split(',').map((id: string) => parseInt(id)).filter((id) => !isNaN(id));
    return ids;
};

export const copyToClipboard = (value: string, message: string) => {
    navigator.clipboard.writeText(value);
    toaster.push(
        <Message showIcon closable duration={5000} type='info' >
            <Tag> {value} </Tag> <br />
            {message}
        </Message>
    , {placement: 'topCenter'});
}

export const domainUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? process.env.NEXT_PUBLIC_VERCEL_URL : 'localhost:3000';

export const getFileExtension = (fileType: string) => {
    let fileExtension = '';
    switch(fileType) {
        case 'pdf':
            fileExtension = 'pdf'
            break;
        case 'ppt':
            fileExtension = 'pptx'
            break;
        case 'word':
            fileExtension = 'docx'
            break;
        case 'html':
            fileExtension = 'html'
            break;
        default:
            throw Error(`Unrecognised file type: ${fileType}`)
    }
    return fileExtension
}

export const exportPDFParseOptions = {
    replace: (domNode: DOMNode) => {
        if (domNode.constructor.name == 'Element') {
            const node = domNode as ReactParserElement;
            if (node.name == 'p') {
                const props = attributesToProps(node.attribs);
                props.style = {
                    ...props.style,
                    wordSpacing: '0',
                }
                return <p {...props} > {domToReact(node.children, exportPDFParseOptions)} </p>;
            }
            return domNode
        }
        else {
        }
    }
};

export const mergeSessiontoHTML = (session: SessionProps | undefined, songs: SongProps[]) => {
    return `<h1>Worship Session:<br /> ${session?.date.toDateString()}</h1><hr />\n`
    + songs.map((songData) => `<h1><strong>${songData.title} - ${songData.artist}</strong></h1>\n` + songData.lyrics + "\n<hr />").join('\n')
}

export function dataURLtoBlob(dataURI: string) {
    // convert base64 to raw binary data held in a string
    // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
    const byteString = atob(dataURI.split(',')[1]);

    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
}

export function isInvalidDate(date: Date | undefined) {
    return date == undefined || isNaN(date.getTime())
}

export function getStartOfMonthDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonthDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}