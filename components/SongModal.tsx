import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import useSWR from 'swr'
import { useFilePicker } from 'use-file-picker'
import Tesseract from 'tesseract.js'
import { Modal, Stack, Button, IconButton, Form, Input, InputGroup, Progress } from 'rsuite'
import { json_fetcher } from '../lib/utils'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdTitle } from 'react-icons/md'
import { Image as ImageIcon } from '@rsuite/icons'
import { SessionProps } from './types'
//import hoverStyles from '../styles/hover.module.css'

interface SongModalProps {
    visibility: boolean,
    handleClose: () => void,
    editSong?: boolean,
    editSongId?: number
}

const initialLyrics = "<h2>Verse 1</h2><p>Type something here</p><h2>Verse 2</h2><p>Type something here</p><h2>Pre-Chorus</h2><p>Type something here</p><h2>Chorus</h2><p>Type something here</p><h2>Bridge</h2><p>Type something here</p>";

const fetcher = json_fetcher();

const SongModal = (props: SongModalProps) => {
    const [formData, setFormData] = useState<Record<string, string>|undefined>(undefined);
    const [songLyrics, setSongLyrics] = useState<string>(props.editSong ? '' : initialLyrics);

    const [loading, setLoading] = useState<boolean>(false);
    const [OCRProgress, setOCRProgress] = useState<number>(0);
    const OCRProgressRef = useRef<number>(0);
    OCRProgressRef.current = OCRProgress

    const { data, error } = useSWR(props.editSong ? `/api/get_song/${props.editSongId}` : null, fetcher);

    useEffect(() => {
        if(data) {
            setFormData(data);
            setSongLyrics(data.lyrics);
        }
    }, [data]);

    const pauseModal = loading || (props.editSong && !data);

    const [openFileSelector, { filesContent, loading : fileLoading, errors }] = useFilePicker({
        readAs: 'DataURL',
        accept: 'image/*',
        multiple: false,
        limitFilesConfig: { max: 1 },
        maxFileSize: 50,
    });

    const addSong = () => {
        const body = JSON.stringify({
            title: formData?.title,
            artist: formData?.artist,
            lyrics: songLyrics
        });
        fetch('/api/add_song', {
            method: 'POST',
            body: body,
        }).then((res) => {
            res.json().then((res_data) => {
                console.log("Added song");
                console.log(res_data);
            });
            props.handleClose();
        }).catch((error) => {
            console.log(error);
        });
    };

    const updateSong = () => {
        const body = JSON.stringify({
            id: props.editSongId,
            title: formData?.title,
            artist: formData?.artist,
            lyrics: songLyrics
        });
        fetch('/api/update_song', {
            method: 'POST',
            body: body,
        }).then((res) => {
            res.json().then((res_data) => {
                console.log("Updated song");
                console.log(res_data);
            });
            props.handleClose();
        }).catch((error) => {
            console.log(error);
        });
    };

    useEffect(() => {
        if (errors.length <= 0 && filesContent.length > 0) {
            setLoading(true);
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
                setLoading(false);
                setOCRProgress(0);
            })
        }
    }, [filesContent, errors])

    return (
        <Modal overflow={false} backdrop='static' open={props.visibility} onClose={props.handleClose}>
            <Modal.Header>
                <Stack wrap direction='row' spacing='2em' >
                    <h4>{props.editSong ? "Edit":"Add"} Song</h4>
                    <IconButton disabled={loading} appearance="primary" icon={<ImageIcon />} onClick={() => {openFileSelector()}} >
                        OCR
                    </IconButton>
                    {pauseModal &&
                        <div style={{ width: '3.5em' }}>
                            <Progress.Circle percent={OCRProgress} strokeColor="#3385ff" status='active' />
                        </div>
                    }
                </Stack>
            </Modal.Header>
            <Modal.Body>
                {/* <InputGroup style={{marginBottom:'0.5em'}}>
                    <InputGroup.Addon>
                        <MdTitle />
                    </InputGroup.Addon>
                    {(props.editSong && data) &&
                        <Input disabled={pauseModal} defaultValue={data.title} ref={titleInputRef} placeholder="Title of the song" />
                    }
                    {(!props.editSong || !data) &&
                        <Input disabled={pauseModal} onChange={} placeholder="Title of the song" />
                    }
                </InputGroup>
                <InputGroup>
                    <InputGroup.Addon>
                        <BsFillPersonFill />
                    </InputGroup.Addon>
                    {(props.editSong && data) &&
                        <Input disabled={pauseModal} defaultValue={data.artist} ref={artistInputRef} placeholder="Artist" />
                    }
                    {(!props.editSong || !data) &&
                        <Input disabled={pauseModal} ref={artistInputRef} placeholder="Artist" />
                    }
                </InputGroup> */}
                <Form fluid
                    onChange={setFormData} formValue={formData} style={{marginBottom:'1em'}} >
                    <Form.Group controlId="title">
                        <InputGroup>
                            <InputGroup.Addon>
                                <MdTitle />
                            </InputGroup.Addon>
                            <Form.Control
                                name="title"
                                placeholder="Song Title"
                                errorMessage={formData?.title ? '' : 'This field is required'}
                                errorPlacement='bottomStart'
                            />
                        </InputGroup>
                    </Form.Group>
                    <Form.Group controlId="artist">
                        <InputGroup>
                            <InputGroup.Addon>
                                <BsFillPersonFill />
                            </InputGroup.Addon>
                            <Form.Control
                                name="artist"
                                placeholder="Artist"
                            />
                        </InputGroup>
                    </Form.Group>
                </Form>
                <ReactQuill readOnly={pauseModal} theme="snow" value={songLyrics} onChange={setSongLyrics}/>
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={pauseModal || !formData?.title} onClick={props.editSong ? updateSong : addSong} color="green" appearance="primary">
                    Confirm
                </Button>
                <Button onClick={props.handleClose} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default SongModal;