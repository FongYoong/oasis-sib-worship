import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ReactCompareSliderProps, ReactCompareSliderImageProps } from 'react-compare-slider'
const ReactCompareSlider = dynamic<ReactCompareSliderProps>(() =>
  import("react-compare-slider").then((module) => module.ReactCompareSlider)
);
const ReactCompareSliderImage = dynamic<ReactCompareSliderImageProps>(() =>
  import("react-compare-slider").then((module) => module.ReactCompareSliderImage)
);
//import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider'
//import ImageFilters from 'canvas-filters'
// import Compressor from 'compressorjs'
//import Tesseract from 'tesseract.js'
import useSWR from 'swr'
import { useFilePicker } from 'use-file-picker'
import { Modal, Stack, Button, IconButton, Form, Loader, InputGroup, Progress, Animation } from 'rsuite'
import { QuillLoadingContext, ReactQuill, quillModules, quillFormats, useQuillToolbar } from './QuillLoad'
import { json_fetcher } from '../lib/utils'
import { SuccessMessage, ErrorMessage } from '../lib/messages'
import { SUCCESS_CODE } from '../lib/status_codes'
import PasswordInput from './PasswordInput'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdTitle } from 'react-icons/md'
import { Image as ImageIcon } from '@rsuite/icons'

interface SongModalProps {
    visibility: boolean,
    handleClose: () => void,
    onSuccess?: () => void,
    editSong?: boolean,
    editSongId?: number
}

const initialLyrics = "<h2>Verse 1</h2><p>Type something here</p><h2>Verse 2</h2><p>Type something here</p><h2>Pre-Chorus</h2><p>Type something here</p><h2>Chorus</h2><p>Type something here</p><h2>Bridge</h2><p>Type something here</p>";

const song_fetcher = json_fetcher('GET');

const SongModal = (props: SongModalProps) => {

    const quillToolbarElement = useQuillToolbar();

    const [formData, setFormData] = useState<Record<string, string>|undefined>(undefined);
    const [songLyrics, setSongLyrics] = useState<string>(props.editSong ? '' : initialLyrics);
    const [password, setPassword] = useState<string>('')
    const [passwordError, setPasswordError] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false);

    const canvasOCR = useRef<HTMLCanvasElement>(null);
    const [OCRLoading, setOCRLoading] = useState<boolean>(false);
    const [OCRProgress, setOCRProgress] = useState<number>(0);
    const OCRProgressRef = useRef<number>(0);
    OCRProgressRef.current = OCRProgress

    const { data, isValidating, error, mutate } = useSWR(props.editSong ? `/api/get_song/${props.editSongId}` : null, song_fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    useEffect(() => {
        if(data) {
            setFormData(data);
            setSongLyrics(data.lyrics);
        }
    }, [data]);

    const pauseModal = loading || isValidating || OCRLoading || (props.editSong && !data);

    const [originalImageDataUrl, setOriginalImageDataUrl] = useState<string>('');
    const [finalImageDataUrl, setFinalImageDataUrl] = useState<string>('');
    const [openFileSelector, { filesContent, loading : fileLoading, errors }] = useFilePicker({
        readAs: 'DataURL',
        accept: 'image/*',
        multiple: false,
        limitFilesConfig: { max: 1 },
        maxFileSize: 50,
    });

    const resetModal = () => {
        setFormData(undefined);
        setSongLyrics(initialLyrics);
        setPassword('');
    }

    const onSuccess = (messsage: string) => {
        if (props.onSuccess) {
            props.onSuccess();
        }
        SuccessMessage(messsage);
        resetModal();
        setLoading(false);
        closeModal();
    }

    const onFailure = (message: string) => {
        setLoading(false);
        ErrorMessage(message)
    }

    const addSong = () => {
        setLoading(true);
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
            onSuccess("Added song");
        }).catch((error) => {
            console.log(error);
            onFailure("Failed to add song");
        });
    };

    const updateSong = () => {
        setLoading(true);
        const body = JSON.stringify({
            id: props.editSongId,
            title: formData?.title,
            artist: formData?.artist,
            lyrics: songLyrics,
            password
        });
        fetch('/api/update_song', {
            method: 'POST',
            body: body,
        }).then((res) => {
            if (res.status == SUCCESS_CODE) {
                res.json().then((res_data) => {
                    console.log("Updated song");
                    console.log(res_data);
                });
                mutate();
                onSuccess("Updated song");
            }
            else {
                throw new Error()
            }
        }).catch((error) => {
            console.log(error);
            onFailure("Failed to update song");
            setPasswordError(true);
        });
    };

    useEffect(() => {
        if (errors.length <= 0 && filesContent.length > 0) {
            fetch(filesContent[0].content).then(it => it.blob().then(async (blob) => {
                console.log(blob)
                const Compressor = (await import('compressorjs')).default;
                new Compressor(blob, {
                    quality: 0.6,
                    convertSize: 1000000,
                    success(compressedFile) {
                        console.log(compressedFile)
                        const reader = new FileReader();
                        reader.onloadend  =  function(){
                            if (typeof reader.result == 'string') {
                                setOriginalImageDataUrl(reader.result);
                            }
                        };
                        reader.readAsDataURL(compressedFile);
                    },
                    error(err) {
                      console.log(err.message);
                    },
                });
            }))
            
        }
    }, [filesContent])

    useEffect(() => {
        if (originalImageDataUrl) {
            setOCRLoading(true);
            setFinalImageDataUrl('');
            if (canvasOCR.current) {
                const context = canvasOCR.current.getContext('2d');
                const imageObj = new Image();
                imageObj.onload = async function() {
                    if (context && canvasOCR.current) {
                        canvasOCR.current.width = imageObj.width;
                        canvasOCR.current.height = imageObj.height;
                        context.drawImage(imageObj, 0,0, imageObj.width, imageObj.height);
                        const originalImageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
                        //import ImageFilters from 'canvas-filters'
                        const ImageFilters = (await import('canvas-filters')).default;
                        const filteredData = ImageFilters.BrightnessContrastGimp(ImageFilters.Gamma(ImageFilters.Sharpen(ImageFilters.GrayScale(ImageFilters.Desaturate(originalImageData)), 0), 5), 5, 50);
                        // ImageFilters.Gamma(ImageFilters.Sharpen(ImageFilters.GrayScale(ImageFilters.Desaturate(originalImageData)), 5), 5);
                        // ImageFilters.Binarize(originalImageData, 1);
                        context.putImageData(filteredData, 0, 0);
                        const dataUrl = context.canvas.toDataURL("image/jpeg");
                        setFinalImageDataUrl(dataUrl);
                        const Tesseract = (await import('tesseract.js')).default;
                        Tesseract.recognize(
                            dataUrl,
                            'eng',
                            { logger: m => {
                                    if (m.status == 'recognizing text' && (m.progress * 100 - OCRProgressRef.current) > 1) {
                                        setOCRProgress(Math.round(m.progress * 100))
                                    }
                                }
                            }
                        ).then(({ data: { text } }) => {
                            setSongLyrics(songLyrics + `<p>${text}</p>`)
                            setOCRLoading(false);
                            setOCRProgress(0);
                        });
                    }
                };
                imageObj.src = originalImageDataUrl;
            }
        }
    }, [originalImageDataUrl])

    const closeModal = () => {
        if (props.editSong) {
            resetModal();
        }
        props.handleClose();
    }

    return (
        <QuillLoadingContext.Provider value={setLoading}>
            <Modal
                style={{
                    backgroundColor: 'rgba(0,0,0,0.2)'
                }}
                overflow={false} backdrop={false} open={props.visibility} onClose={closeModal} >
                {isValidating &&
                    <Loader style={{zIndex: 1000}} backdrop center content="Fetching song..." />
                }
                <Modal.Header>
                    <canvas ref={canvasOCR} style={{display: 'none'}} />
                    <Stack wrap direction='row' spacing='2em' >
                        <h4>{props.editSong ? "Edit":"Add"} Song</h4>
                        <IconButton disabled={OCRLoading} appearance="primary" icon={<ImageIcon />} onClick={() => {openFileSelector()}} >
                            OCR
                        </IconButton>
                        {OCRLoading &&
                            <div style={{ width: '3.5em' }}>
                                <Progress.Circle percent={OCRProgress} strokeColor="#3385ff" status='active' />
                            </div>
                        }
                    </Stack>
                </Modal.Header>
                <Modal.Body>
                    <Form fluid
                        onChange={setFormData} formValue={formData} style={{marginBottom:'1em'}} >
                        <Form.Group controlId="title" id='title' >
                            <InputGroup>
                                <InputGroup.Addon>
                                    <MdTitle />
                                </InputGroup.Addon>
                                <Form.Control
                                    name="title"
                                    placeholder="Song Title"
                                    errorMessage={formData?.title ? '' : 'This field is required'}
                                    errorPlacement='bottomStart'
                                    readOnly={pauseModal}
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="artist" id='artist' >
                            <InputGroup>
                                <InputGroup.Addon>
                                    <BsFillPersonFill />
                                </InputGroup.Addon>
                                <Form.Control
                                    name="artist"
                                    placeholder="Artist"
                                    readOnly={pauseModal}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Form>
                    <div style={{
                        height: '50vh',
                        border: '3px solid #150080',
                    }} >
                        <ReactQuill
                            style={{
                                height: `calc(100% - ${quillToolbarElement ? quillToolbarElement.clientHeight : 0}px)`,
                            }}
                            readOnly={pauseModal} theme="snow" modules={quillModules} formats={quillFormats}
                            value={songLyrics} onChange={setSongLyrics}
                        />
                    </div>
                    {props.editSong &&
                        <PasswordInput setPassword={setPassword} passwordError={passwordError} setPasswordError={setPasswordError} />
                    }
                </Modal.Body>
                <Modal.Footer>
                    <Stack spacing='1em' direction='row' justifyContent='flex-end' style={{marginBottom: '1em'}} >
                        <Button loading={pauseModal} disabled={pauseModal || !formData?.title} onClick={props.editSong ? updateSong : addSong} color="green" appearance="primary">
                            Confirm
                        </Button>
                        <Button onClick={closeModal} appearance="subtle">
                            Cancel
                        </Button>
                    </Stack>
                    {filesContent.length > 0 && finalImageDataUrl &&
                        <Animation.Collapse>
                            <Stack spacing='1em' direction='column' justifyContent='center' >
                                <h2>OCR Preview</h2>
                                <ReactCompareSlider
                                    itemOne={<ReactCompareSliderImage src={filesContent[0].content} alt="Original Image" />}
                                    itemTwo={<ReactCompareSliderImage src={finalImageDataUrl} alt="Filtered Image" />}
                                />
                            </Stack>
                        </Animation.Collapse>
                    }
                </Modal.Footer>
            </Modal>
        </QuillLoadingContext.Provider>
    )
}

export default SongModal;

            // const body = {
            //     image: filesContent[0].content
            // };
            // fetch('/api/ocr', {
            //     method: 'POST',
            //     body,
            // }).then((res) => {
            //     res.json().then((text) => {
            //         console.log("OCR successful");
            //         setSongLyrics(songLyrics + `<p>${text}</p>`)
            //         setOCRLoading(false);
            //         setOCRProgress(0);
            //     });
            // }).catch((error) => {
            //     console.log(error);
            // });
            // axios.request({
            //     method: "post", 
            //     url: "/api/ocr", 
            //     data: body, 
            //     onUploadProgress: (p) => {
            //         console.log(p.loaded / p.total);
            //         setOCRProgress(p.loaded / p.total);
            //     }
            // }).then (text => {
            //     console.log("OCR successful");
            //     setSongLyrics(songLyrics + `<p>${text}</p>`)
            //     setOCRLoading(false);
            //     setOCRProgress(0);
            // })