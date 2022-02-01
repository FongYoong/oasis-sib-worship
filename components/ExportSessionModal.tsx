import { useState, useRef, useEffect } from 'react'
import parse from 'html-react-parser';
import slugify from 'slugify'
import { jsPDF } from "jspdf"
let jspdfInstance = new jsPDF();
import FileSaver from 'file-saver'
import useSWR from 'swr'
import { Modal, Stack, Button, Dropdown } from 'rsuite'
import { json_fetcher, exportPDFParseOptions, mergeSessiontoHTML, getFileExtension } from '../lib/utils'
import { SessionProps, SongProps } from '../lib/types'
import { SuccessMessage, ErrorMessage } from '../lib/messages';
import { SiMicrosoftpowerpoint, SiMicrosoftword } from 'react-icons/si'
import { GrDocumentPdf } from 'react-icons/gr'
import { BsGlobe } from 'react-icons/bs'

interface ExportSessionModalProps {
    visibility: boolean,
    handleClose: () => void,
    onSuccess?: () => void,
    sessionData?: SessionProps
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

const songs_fetcher = json_fetcher('GET');

const ExportSessionModal = (props: ExportSessionModalProps) => {

    useEffect(() => { import("jspdf/dist/polyfills.es") }, []);

    const lyricsDivRef = useRef<HTMLDivElement>(null);
    const { data, isValidating, error } = useSWR(props.visibility ? `/api/get_song/${props.sessionData?.songs}?multiple` : null, songs_fetcher);

    const songArray: SongProps[] = data ? data : [];
    const mergedLyrics = mergeSessiontoHTML(props.sessionData, songArray);
    const parsedLyrics = data ? parse(mergedLyrics, exportPDFParseOptions) : <></>;

    const [exportType, setExportType] = useState<ExportType>('ppt');
    const exportTypeDetails = getExportDetails(exportType);
    const [exportLoading, setExportLoading] = useState<boolean>(false);

    const onSuccess = () => {
        if (props.onSuccess) {
            props.onSuccess();
        }
        setExportLoading(false);
        SuccessMessage("Exported song")
        props.handleClose();
    }

    const onFailure = () => {
        setExportLoading(false);
        ErrorMessage("Failed to export session")
    }

    const exportSession = () => {
        const file_name = slugify(`${new Date(props.sessionData?.date as unknown as string).toDateString()} - ${props.sessionData?.worship_leader}`, '_');
        const file_extension = getFileExtension(exportType);
        setExportLoading(true);
        if (exportType == 'pdf') {
            if (lyricsDivRef.current) {
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
            const blob = new Blob([mergedLyrics], {type: "text/plain;charset=utf-8"});
            FileSaver.saveAs(blob, `${file_name}.${file_extension}`);
            onSuccess();
        }
        else {
            exportSessionAPI(file_name, file_extension);
        }
    }

    const exportSessionAPI = (file_name: string, file_extension: string) => {
        const body = JSON.stringify({
            exportType,
            id: props.sessionData?.id,
            song_ids: props.sessionData?.songs
        });
        fetch('/api/export_session', {
            method: 'POST',
            body: body,
        }).then((res) => {
            res.blob().then((binary_blob) => {
                console.log("Successfully exported session");
                FileSaver.saveAs(binary_blob, `${file_name}.${file_extension}`);
            });
            onSuccess();
        }).catch((error) => {
            console.log(error);
            onFailure();
        });
    };

    const noSongs = props.sessionData?.songs && props.sessionData?.songs.length < 1;

    const pauseModal = (!noSongs && !data) || exportLoading;

    return (
        <Modal overflow={false} open={props.visibility} onClose={props.handleClose}>
            { data &&
                <div style={{ display: 'none'}} >
                    <div ref={lyricsDivRef} style={{ width: '100vw', height: '100vh', wordSpacing: 10 }} >
                        {parsedLyrics}
                    </div>
                </div>
            }
            <Modal.Header>
                <Modal.Title>Export Session</Modal.Title>
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
                            ["ppt", "word", "pdf", "html"].map((type: string, index: number) => {
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
                    {noSongs &&
                        <h4>No songs to export 🗅</h4>
                    }
                </Stack>
            </Modal.Body>
            <Modal.Footer>
                <Button loading={pauseModal} disabled={!props.sessionData || noSongs} onClick={exportSession} color="blue" appearance="primary">
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