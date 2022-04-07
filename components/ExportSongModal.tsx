import { useState, useRef, useEffect } from 'react'
import parse from 'html-react-parser';
import slugify from 'slugify'
import { jsPDF } from "jspdf"
let jspdfInstance = new jsPDF();
import FileSaver from 'file-saver'
import useSWR from 'swr'
import { Modal, Stack, Button, IconButton, Dropdown, Animation } from 'rsuite'
import ExportPPTSettings from './ExportPPTSettings'
import { PPTSettings, defaultPPTSettings } from '../lib/powerpoint'
import { json_fetcher, exportPDFParseOptions, getFileExtension, htmlExportStyles } from '../lib/utils'
import { SongProps } from '../lib/types'
import { SuccessMessage, ErrorMessage } from '../lib/messages';
import { AiFillSetting } from 'react-icons/ai'
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

    useEffect(() => { import("jspdf/dist/polyfills.es") }, []);

    const lyricsDivRef = useRef<HTMLDivElement>(null);
    const { data, isValidating, error } = useSWR(props.visibility ? `/api/get_song/${props.songData?.id}` : null, song_fetcher);
    const parsedLyrics = data ? parse(`<h2><strong>${data.title}</strong></h2>\n<h3>${data.artist}</h3>\n<hr />\n` + data.lyrics, exportPDFParseOptions) : <></>;
    const [showPPTSettings, setShowPPTSettings] = useState<boolean>(false);
    const [pptSettings, setPPTSettings] = useState<PPTSettings>(defaultPPTSettings);

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
        ErrorMessage("Failed to export song")
    }

    const exportSong = () => {
        setExportLoading(true);
        const file_name = slugify(`${data.title} - ${data.artist}`, '_');
        const file_extension = getFileExtension(exportType);
        if(exportType == 'pdf') {
            if (lyricsDivRef.current) {
                jspdfInstance.html(lyricsDivRef.current, {
                    callback: function (doc: jsPDF) {
                        const blob = doc.output('blob');
                        FileSaver.saveAs(blob, `${file_name}.pdf`);
                        jspdfInstance = new jsPDF();
                        onSuccess();
                    },
                    filename: `${file_name}.pdf`,
                    autoPaging: 'text',
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
            const blob = new Blob([data.lyrics + htmlExportStyles], {type: "text/plain;charset=utf-8"});
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
            pptSettings: exportType == 'ppt' ? pptSettings : undefined
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
            { data &&
                <div style={{ display: 'none'}} >
                    <div ref={lyricsDivRef} style={{
                        width: '21cm', height: '29.7cm',
                        fontFamily: 'serif',
                        fontSize: '1rem',
                        //wordSpacing: 10,
                        //letterSpacing: '0.15rem',
                    }} >
                        {parsedLyrics}
                    </div>
                </div>
            }
            <Modal.Header>
                <Modal.Title>Export Song</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Stack direction='column' spacing='1em' alignItems='center' justifyContent='center' >
                    <Stack direction='row' spacing='1em' alignItems='center' justifyContent='center' >
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
                        <Animation.Slide in={exportType=='ppt'} placement='left' >
                            <IconButton appearance={showPPTSettings ? 'primary' : undefined} icon={<AiFillSetting />}
                                onClick={() => {
                                    setShowPPTSettings(!showPPTSettings)
                                }}
                            />
                        </Animation.Slide>
                        {exportType=='ppt' && showPPTSettings && 
                            <Animation.Slide in={exportType=='ppt' && showPPTSettings} placement='left' >
                                <Button
                                    appearance='primary' color='orange'
                                    onClick={() => {
                                        setPPTSettings(defaultPPTSettings)
                                    }}
                                >
                                    Reset
                                </Button>
                            </Animation.Slide>
                        }
                    </Stack>
                    <ExportPPTSettings show={exportType=='ppt' && showPPTSettings} settings={pptSettings} setSettings={setPPTSettings} />
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