import { useState, useRef, useEffect } from 'react'
import parse,{ Element as ReactParserElement, DOMNode, domToReact, attributesToProps  } from 'html-react-parser';
import slugify from 'slugify'
import { jsPDF } from "jspdf"
let jspdfInstance = new jsPDF();
import FileSaver from 'file-saver'
import useSWR from 'swr'
import { Modal, Stack, Button, Dropdown, Tag, toaster, Message } from 'rsuite'
import { json_fetcher } from '../lib/utils'
import { SongProps } from './types'
import { SiMicrosoftpowerpoint, SiMicrosoftword } from 'react-icons/si'
import { GrDocumentPdf } from 'react-icons/gr'
import { BsGlobe } from 'react-icons/bs'

interface ExportSessionModalProps {
    visibility: boolean,
    handleClose: () => void,
    onSuccess?: () => void,
    songData?: SongProps // This data is incomplete as it does not contain lyrics
}

type ExportType = "ppt" | "pdf" | "word" | "html";

const getExportDetails = (exportType: ExportType) => {
    if (exportType == "pdf") {
        return {
            title: "PDF",
            icon: <GrDocumentPdf />
        }
    }
    else if (exportType == "ppt") {
        return {
            title: "PowerPoint (.pptx)",
            icon: <SiMicrosoftpowerpoint color='darkred' />
        }
    }
    else if (exportType == "word") {
        return {
            title: "Word (.docx)",
            icon: <SiMicrosoftword color='darkblue' />
        }
    }
    else if (exportType == "html") {
        return {
            title: "HTML",
            icon: <BsGlobe color='lightblue' />
        }
    }
}

const song_fetcher = json_fetcher('GET');

const ExportSessionModal = (props: ExportSessionModalProps) => {

    useEffect(() => { import("jspdf/dist/polyfills.es") }, []);

    const lyricsDivRef = useRef<HTMLDivElement>(null);
    const { data, isValidating, error } = useSWR(props.visibility ? `/api/get_song/${props.songData?.id}` : null, song_fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });
    const parseOptions = {
        replace: (domNode: DOMNode) => {
            //console.log(domNode)
            if (domNode.constructor.name == 'Element') {
                const node = domNode as ReactParserElement;
                if (node.name == 'p') {
                    const props = attributesToProps(node.attribs);
                    props.style = {
                        ...props.style,
                        wordSpacing: '0',
                    }
                    return <p {...props} > {domToReact(node.children, parseOptions)} </p>;
                }
                return domNode
            }
            else {
            }
        }
    };
    const processedLyrics = data ? parse(data.lyrics, parseOptions) : <></>;

    const [exportType, setExportType] = useState<ExportType>('pdf');
    const exportTypeDetails = getExportDetails(exportType);
    const [exportLoading, setExportLoading] = useState<boolean>(false);

    const onSuccess = () => {
        if (props.onSuccess) {
            props.onSuccess();
        }
        props.handleClose();
        setExportLoading(false);
    }

    const onFailure = () => {
        toaster.push(
            <Message showIcon closable duration={2500} type='error' >
                Failed to export <Tag> {data.title} - {data.artist} </Tag> <br/> to {getExportDetails(exportType)?.title}
            </Message>
        , {placement: 'topCenter'});
    }

    const exportSong = () => {
        const file_name = slugify(`${data.title} - ${data.artist}`, '_');
        setExportLoading(true);
        if(exportType == 'pdf') {
            if (lyricsDivRef.current) {
                //jspdfInstance.setCharSpace(1)
                jspdfInstance.html(lyricsDivRef.current, {
                    callback: function (doc: jsPDF) {
                        const blob = doc.output('blob');
                        FileSaver.saveAs(blob, `${file_name}.pdf`);
                        jspdfInstance = new jsPDF();
                        onSuccess();
                    },
                    filename: `${file_name}.pdf`,
                    margin: 10,
                    x: 0,
                    y: 0,
                    html2canvas: {
                        scale: 0.3
                    }
                });
            }
            else {
                onFailure();
            }
        }
        else if (exportType == 'html') {
            const blob = new Blob([data.lyrics], {type: "text/plain;charset=utf-8"});
            FileSaver.saveAs(blob, `${file_name}.html`);
            onSuccess();
        }
        else {
            exportSongAPI(file_name);
        }
    }

    const exportSongAPI = (file_name: string) => {
        const body = JSON.stringify({
            exportType,
            id: props.songData?.id,
        });
        fetch('/api/export_song', {
            method: 'POST',
            body: body,
        }).then((res) => {
            res.blob().then((binary_blob) => {
                console.log("Successfully exported song");
                FileSaver.saveAs(binary_blob, `${file_name}.${exportType == 'ppt' ? '.pptx': '.docx'}`);
            });
            onSuccess();
        }).catch((error) => {
            console.log(error);
        });
    };

    const pauseModal = !data || exportLoading ;

    return (
        <Modal overflow={false} open={props.visibility} onClose={props.handleClose}>
            { data &&
                <div style={{ display: 'none'}} >
                    <div ref={lyricsDivRef} style={{ width: '100vw', height: '100vh', wordSpacing: 10 }} >
                        {processedLyrics}
                    </div>
                </div>
            }
            <Modal.Header>
                <Modal.Title>Export Song</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Stack direction='column' spacing='1em' >
                <Dropdown title={exportTypeDetails?.title} icon={exportTypeDetails?.icon}
                    onSelect={(eventKey: string, event: unknown) => {
                        const type = ((event as React.MouseEvent<Element, MouseEvent>).target as Element).getAttribute('export-type');
                        setExportType(type as ExportType)
                    }}
                >
                    {
                        ["pdf", "ppt", "word", "html"].map((type: string, index: number) => {
                            const detail = getExportDetails(type as ExportType);
                            if (detail) {
                                return (
                                    <Dropdown.Item key={index} export-type={type} eventKey={detail.title} icon={detail.icon}>
                                        &nbsp;&nbsp;{detail.title}
                                    </Dropdown.Item>
                                );
                            }
                        })
                    }
                </Dropdown>
                </Stack>
            </Modal.Body>
            <Modal.Footer>
                <Button loading={pauseModal} disabled={!props.songData} onClick={exportSong} color="blue" appearance="primary">
                    Download
                </Button>
                <Button onClick={props.handleClose} appearance="subtle">
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ExportSessionModal;