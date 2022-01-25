import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
//const Tesseract  = dynamic(() => import("tesseract.js"), { ssr: false });
import { useFilePicker } from 'use-file-picker';
import Tesseract from 'tesseract.js';
import { Modal, Stack, Button, IconButton, Input, InputGroup, Loader, Progress } from 'rsuite'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdTitle } from 'react-icons/md'
import { Image as ImageIcon } from '@rsuite/icons';
import { SessionProps } from './types'
//import hoverStyles from '../styles/hover.module.css'

interface AddSongModalProps {
    visibility: boolean,
    handleClose: () => void
}

const initialLyrics = "<h2>Verse 1</h2><p>Type something here</p><h2>Verse 2</h2><p>Type something here</p><h2>Pre-Chorus</h2><p>Type something here</p><h2>Chorus</h2><p>Type something here</p><h2>Bridge</h2><p>Type something here</p>";

const AddSongModal = (props: AddSongModalProps) => {
    const [songLyrics, setSongLyrics] = useState<string>(initialLyrics);
    const [processingOCR, setProcessingOCR] = useState<boolean>(false);
    const [OCRProgress, setOCRProgress] = useState<number>(0);
    const OCRProgressRef = useRef<number>(0);
    OCRProgressRef.current = OCRProgress

    const [openFileSelector, { filesContent, loading, errors }] = useFilePicker({
        readAs: 'DataURL',
        accept: 'image/*',
        multiple: false,
        limitFilesConfig: { max: 1 },
        maxFileSize: 50,
    });

    const handleConfirm = () => {
        console.log(songLyrics)
    };

    useEffect(() => {
        if (errors.length <= 0 && filesContent.length > 0) {
            setProcessingOCR(true);
            Tesseract.recognize(
                filesContent[0].content,
                'eng',
                { logger: m => {
                        if (m.status == 'recognizing text' && (m.progress * 100 - OCRProgressRef.current) > 1) {
                            setOCRProgress(Math.round(m.progress * 100))
                        }
                    }
                }
            ).then(({ data: { text } }) => {
                setSongLyrics(songLyrics + `<p>${text}</p>`)
                setProcessingOCR(false);
                setOCRProgress(0);
            })
        }
    }, [filesContent, errors])

    return (
        <Modal overflow={false} backdrop='static' open={props.visibility} onClose={props.handleClose}>

            <Modal.Header>
                <Stack wrap direction='row' spacing='2em' >
                    <h4>Add Song</h4>
                    <IconButton disabled={processingOCR} appearance="primary" icon={<ImageIcon />} onClick={() => {openFileSelector()}} >
                        OCR
                    </IconButton>
                    {processingOCR &&
                        // <Loader size="md" content="Extracting text..." />
                        <Progress.Circle percent={OCRProgress} strokeColor="#3385ff" status='active' />
                    }
                </Stack>
            </Modal.Header>
            <Modal.Body>
                <InputGroup style={{marginBottom:'0.5em'}}>
                    <InputGroup.Addon>
                        <MdTitle />
                    </InputGroup.Addon>
                    <Input placeholder="Title of the song" />
                </InputGroup>
                <InputGroup>
                    <InputGroup.Addon>
                        <BsFillPersonFill />
                    </InputGroup.Addon>
                    <Input placeholder="Artist" />
                </InputGroup>
                    <ReactQuill readOnly={processingOCR} theme="snow" value={songLyrics} onChange={setSongLyrics}/>
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={processingOCR} onClick={handleConfirm} color="green" appearance="primary">
                    Confirm
                </Button>
                <Button onClick={props.handleClose} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AddSongModal;