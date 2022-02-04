import { Element as ReactParserElement, DOMNode, domToReact, attributesToProps  } from 'html-react-parser';
import { CopyClipboardMessage } from './messages';
import { SessionProps, SongProps, PageName } from './types';
import { allErrorCodes } from './status_codes';

//export const domainUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? process.env.NEXT_PUBLIC_VERCEL_URL : 'localhost:3000';
export const domainUrl = process.env.NEXT_PUBLIC_VERCEL_URL ? "oasis-sib-worship.vercel.app" : 'localhost:3000';

export const resolvePageRoute = (path: string) => {
    if (path == '/') {
        return PageName.Home
    }
    else if (path == '/all_songs') {
        return PageName.AllSongs
    }
    else if (path == '/about') {
        return PageName.About
    }
    else if (path.includes('/view_song')) {
        return PageName.ViewSong
    }
    else if (path.includes('/view_session')) {
        return PageName.ViewSession
    }
    else if (path == undefined) {
        return PageName.None
    }
    else {
        return PageName.None
    }
}

export const isPresentOrFutureDate = (date: Date) => {
    const today = new Date();
    return date.setHours(0, 0, 0, 0) >= today.setHours(0, 0, 0, 0);
};

export const json_fetcher = (method: string, body?: object) => (url: string) => {
    return fetch(url, {
        method: method,
        body: JSON.stringify(body)
    })
    .then(r => {
        if (allErrorCodes.includes(r.status)) {
            throw new Error(r.statusText)
        }
        return r.json()
    });
}

export const convertStringToIds = (data: string) => {
    const ids = data.split(',').map((id: string) => parseInt(id)).filter((id) => !isNaN(id));
    return ids;
};

export const copyToClipboard = (value: string, message: string) => {
    navigator.clipboard.writeText(value);
    CopyClipboardMessage(value, message);
}

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
    return `<h2>Worship Session:<br /> ${session?.date.toDateString()}</h2><hr />\n`
    + songs.map((songData) => `<h2><strong>${songData.title}</strong></h2>\n<h3>${songData.artist}</h3>\n<hr />\n` + songData.lyrics + "\n<hr />").join('\n')
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

export function isInvalidDate(date?: Date) {
    return date == undefined || isNaN(date.getTime())
}

export function dateToISOString(date?: Date) {
    return isInvalidDate(date) ? '' : date?.toISOString()
}

export function getStartOfMonthDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonthDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}