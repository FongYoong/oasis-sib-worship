import { useState, useEffect } from 'react'
import slugify from 'slugify'
import FileSaver from 'file-saver'
import useSWR from 'swr'
import { Modal, Stack, Button, Dropdown, Tag, toaster, Message } from 'rsuite'
import { json_fetcher, getFileExtension } from '../lib/utils'
import { SongProps } from '../lib/types'
import { SiMicrosoftpowerpoint, SiMicrosoftword } from 'react-icons/si'
import { GrDocumentPdf } from 'react-icons/gr'
import { BsGlobe } from 'react-icons/bs'

interface ExportSongModalProps {
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

const ExportSongModal = (props: ExportSongModalProps) => {
    const { data, isValidating, error } = useSWR(props.visibility ? `/api/get_song/${props.songData?.id}` : null, song_fetcher);

    const [exportType, setExportType] = useState<ExportType>('ppt');
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
        const file_extension = getFileExtension(exportType);
        setExportLoading(true);
        if (exportType == 'html') {
            const blob = new Blob([data.lyrics], {type: "text/plain;charset=utf-8"});
            FileSaver.saveAs(blob, `${file_name}.${file_extension}`);
            onSuccess();
        }
        else {
            exportSongAPI(file_name, file_extension);
        }
    }

    const exportSongAPI = (file_name: string, file_extension: string) => {
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
                FileSaver.saveAs(binary_blob, `${file_name}.${file_extension}`);
            });
            onSuccess();
        }).catch((error) => {
            console.log(error);
            onFailure();
        });
    };

    const pauseModal = !data || exportLoading ;

    return (
        <Modal overflow={false} open={props.visibility} onClose={props.handleClose}>
            <Modal.Header>
                <Modal.Title>Export Song</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Stack direction='row' spacing='1em' alignItems='center' justifyContent='center' >
                    <h5>Export Type: </h5>
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

export default ExportSongModal;

// useEffect(() => { import("jspdf/dist/polyfills.es") }, []);

// if(exportType == 'pdf') {
//     if (lyricsDivRef.current) {
//         jspdfInstance.html(lyricsDivRef.current, {
//             callback: function (doc: jsPDF) {
//                 const blob = doc.output('blob');
//                 FileSaver.saveAs(blob, `${file_name}.pdf`);
//                 jspdfInstance = new jsPDF();
//                 onSuccess();
//             },
//             filename: `${file_name}.pdf`,
//             margin: 10,
//             x: 0,
//             y: 0,
//             html2canvas: {
//                 scale: 0.3
//             }
//         });
//     }
//     else {
//         onFailure();
//     }
// }