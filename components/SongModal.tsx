import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import AnimateHeight from 'react-animate-height';
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
import { Modal, Stack, Button, IconButton, Form, Loader, InputGroup, Progress, Animation, Divider, Whisper, Popover } from 'rsuite'
import { WhisperInstance } from 'rsuite/cjs/Whisper'
import { ReactQuill, quillSongModules, quillSongFormats, useQuillElements, generateChordId,
    addChordFormat, fixChordFormat, QuillSelectToolTip, QuillChordToolTip, 
} from './QuillLoad'
import { GeniusSong } from '../lib/types'
import { geniusLyricsToHTML } from '../lib/genius'
import { json_fetcher } from '../lib/utils'
import { SuccessMessage, ErrorMessage } from '../lib/messages'
import { SUCCESS_CODE } from '../lib/status_codes'
import PasswordInput from './PasswordInput'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdTitle } from 'react-icons/md'
import { SiGenius } from 'react-icons/si'
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

interface renderGeniusSongProps {
    title: string
    artist: string
    onConfirm: (newLyrics: string)=>void
}

// eslint-disable-next-line react/display-name
const renderGeniusSong = (props : renderGeniusSongProps) => ({ onClose, className }: {onClose: ()=>void, className: string} , ref: React.RefObject<HTMLDivElement>) => {

    const containerRef = useRef() as React.MutableRefObject<HTMLDivElement>
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [close, setClose] = useState<boolean>(false);
    const [songData, setSongData] = useState<GeniusSong|undefined>(undefined);

    const getGeniusSong = () => {
        setLoading(true);
        fetch('/api/genius/get_song', {
            method: 'POST',
            body: JSON.stringify({
                title: props.title,
                artist: props.artist
            }),
        }).then((res) => {
            if (res.status == SUCCESS_CODE) {
                res.json().then((res_data) => {
                    console.log(res_data);
                    setLoading(false);
                    if (res_data.song) {
                        setSongData(res_data.song);
                    }
                    else {
                        setError(true);
                    }
                });
            }
            else {
                setError(true);
                setLoading(false);
                throw new Error()
            }
        }).catch((error) => {
            setError(true);
            setLoading(false);
            console.log(error);
        });
    }

    useEffect(() => {
        getGeniusSong();
    }, []);

    useEffect(() => {
        if(!loading && !error && !close) {
            setTimeout(() => {
                containerRef.current?.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
            }, 200);   
        }
    }, [loading, error]);


    const htmlLyrics = !loading && !error ? geniusLyricsToHTML(songData?.lyrics) : '';

    const onConfirm = () => {
        props.onConfirm(htmlLyrics);
        smoothClose();
    }

    const smoothClose = () => {
        setClose(true);
        setTimeout(() => {
            onClose();
        }, 150);
    }

    return (
      <Popover ref={ref} className={className} >
        <Stack ref={containerRef} spacing='1em' direction='column' justifyContent='center' >
            {loading && <Loader content="Searching GENIUS..." />}
            {error && <p>Could not find song. 😥</p>}
            <AnimateHeight
                animateOpacity
                duration={300}
                height={!loading && !error && !close ? "auto" : 0}
            >
                <h5>{songData?.title}</h5>
                <Divider />
                <ReactQuill
                    style={{
                        border: '5px solid rgba(28,110,164,0.12)',
                        height: '50vh'
                    }}
                    text={htmlLyrics}
                    options={{theme: 'bubble', readOnly: true}}
                />
            </AnimateHeight>
            <Stack spacing='1em' direction='row' justifyContent='center' >
                <Button disabled={loading || error} onClick={onConfirm} color="cyan" appearance="primary">
                    Add
                </Button>
                <Button onClick={smoothClose} color='red' appearance="primary">
                    Cancel
                </Button>
            </Stack>
        </Stack>
      </Popover>
    );
};

const SongModal = (props: SongModalProps) => {

    const [formData, setFormData] = useState<Record<string, string>|undefined>(undefined);
    const [songLyrics, setSongLyrics] = useState<string>(props.editSong ? '' : initialLyrics);
    const [lyricsReady, setLyricsReady] = useState<boolean>(!props.editSong);
    const [password, setPassword] = useState<string>('')
    const [passwordError, setPasswordError] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false);


    const canvasOCR = useRef<HTMLCanvasElement>(null);
    const [OCRLoading, setOCRLoading] = useState<boolean>(false);
    const [OCRProgress, setOCRProgress] = useState<number>(0);
    const OCRProgressRef = useRef<number>(0);
    OCRProgressRef.current = OCRProgress

    const geniusWhisperRef = useRef<WhisperInstance>();

    const { data, isValidating, error, mutate } = useSWR(props.editSong ? `/api/get_song/${props.editSongId}` : null, song_fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    const quillInstance = useRef<any>();
    const { quillToolbar, chordToolbarButton } = useQuillElements(quillInstance);
    const quillEditorScrollTop = useRef<number>(0);
    const [chordToolTipPosition, setChordToolTipPosition] = useState({
        top: 0,
        left: 0
    });
    const [showChordToolTip, setShowChordToolTip] = useState(false);
    const chordToolTipOnConfirm = useRef<(value: string) => void>((value: string) => value);
    const chordToolTipOnClose = useRef<() => void>(() => {return});
    const updateChordToolTip = useRef<boolean>(true);

    const [selectToolTipPosition, setSelectToolTipPosition] = useState({
        top: 0,
        left: 0
    });
    const [showSelectToolTip, setShowSelectToolTip] = useState(false);

    const updateQuillSizing = () => {
        if(quillInstance.current) {
            setTimeout(() => {
                const quillOffset = quillInstance.current ? quillInstance.current.getModule('toolbar').container.clientHeight : 40;
                const editorElement = quillInstance.current.container as HTMLElement;
                editorElement.style.height = `calc(100% - ${quillOffset}px)`;
            }, 0)
        }
    }

    const initQuill = (Quill: any) => {
        addChordFormat(Quill);
    }

    const initQuillInstance = (quill: any) => {
        quillInstance.current = quill;
        const toolbar  = quill.getModule('toolbar').container;
        const removeHighlight = () => {
            // this.quill.formatText(range, {
            //     chordHighlight: null
            // });
            const highlightElements = Array.from(quill.container.getElementsByClassName('quill-chord-selected'));
            highlightElements.forEach((el) => {
                (el as HTMLElement).outerHTML = (el as HTMLElement).innerHTML;
            });
            quill.history.clear();
        }
        // Register handler for chord button
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        quill.getModule('toolbar').addHandler('chord', function (this: {quill:any}) {
            const range = this.quill.getSelection();
            const selectedText = this.quill.getText(range);
            if (!selectedText.includes('\n') && range.length > 0) {
                const bounds = this.quill.getBounds(this.quill.getSelection());
                const format = this.quill.getFormat(range);

                if (('chord' in format)) {
                    console.log('Has a chord')
                    const value = format.chord;
                    const chordId = generateChordId(value.chord, value.index, value.length);
                    const chordElement = quill.container.getElementsByClassName(chordId)[0];
                    chordElement.outerHTML = chordElement.innerHTML;
                }
                else {
                    console.log('No chord detected')
                    // highlight selected text
                    // if (('chordHighlight' in format)) {
                    //     removeHighlight();
                    // }
                    // else {
                    this.quill.formatText(range, {
                        chordHighlight: true,
                    });
                    // }
                    chordToolTipOnClose.current = () => {
                        removeHighlight();
                    }

                    const highlightElement = quill.container.getElementsByClassName('quill-chord-selected')[0] as HTMLElement;
                    const parent = highlightElement.parentElement;
                    if (parent && parent.nodeName == "SPAN" && parent.classList.contains("quill-chord")) {
                        console.log('Found a chord!')
                        parent.outerHTML = parent.innerHTML;
                        removeHighlight();
                        return;
                    }

                    // open tooltip and get input
                    const editor = Array.from(quill.container.getElementsByClassName('ql-editor'))[0] as HTMLElement; // .filter((e: HTMLElement) => e.getAttribute("contenteditable") == "true")
                    editor.onscroll = function () {
                        if (updateChordToolTip.current) {
                            window.requestAnimationFrame(function() {
                                const diff = editor.scrollTop - quillEditorScrollTop.current;
                                quillEditorScrollTop.current = editor.scrollTop;
                                setChordToolTipPosition((previousValue) => { return {
                                    ...previousValue,
                                    top: previousValue.top - diff,
                                }})
                                updateChordToolTip.current = true;
                            });
                            updateChordToolTip.current = false;
                        }
                    }
                    setShowChordToolTip(true);
                    setChordToolTipPosition({
                        top: 5 + bounds.top + bounds.height + (toolbar ? toolbar.clientHeight : 0),
                        left: bounds.left
                    })
                    chordToolTipOnConfirm.current = (chord: string) => {
                        //this.quill.removeFormat(range);
                        this.quill.formatText(range, {
                            chord: {
                                chord,
                                index: range.index,
                                length: range.length
                            }
                        });
                        removeHighlight();
                    };
                }
            }
            else {
                setShowChordToolTip(false);
            }
        });

        // Handle text change
        quill.on('text-change', (delta: any) => {
            setSongLyrics(quill.root.innerHTML);
            // When entering a newline, the chord formatting will cause bugs and crashes.
            // Hence, the chord formatting is removed for the new empty line.
            if (delta.ops && delta.ops.filter((op: any) => {
                    return "insert" in op && op.insert == '\n'
                }).length > 0)
            {
                const removeChordSpan = () => {
                    setTimeout(() => {
                        const parent = window.getSelection()?.anchorNode?.parentElement?.parentElement;
                        if (parent && parent.tagName == 'SPAN' && parent.hasAttribute('data-chord')) {
                            parent.outerHTML = parent.innerHTML;
                            removeChordSpan();
                        }
                    }, 0);
                }
                removeChordSpan();
            }
            // When deleting a newline, a ql-cursor may appear if there's a chord formatting enabled.
            // When a space is pressed, a crash will occur. Hence, ql-cursor must be removed.
            if (delta.ops && delta.ops.filter((op: any) => {
                return "delete" in op
            }).length > 0) {
                Array.from(quill.container.getElementsByClassName('ql-cursor')).forEach((el) => {
                    (el as HTMLElement).remove();
                })
            }
            fixChordFormat(quill);
        });
        // Handle text selection
        quill.on('selection-change', (range: {index: number, length: number}) => {
            if (range && range.length > 0 && !quill.getText(range.index, range.length).includes('\n')) {
                const bounds = quill.getBounds(range.index, range.length);
                setShowSelectToolTip(true);
                setSelectToolTipPosition({
                    top: 8 + bounds.top + bounds.height + (toolbar ? toolbar.clientHeight : 0),
                    left: bounds.left
                });
            }
            else {
                setShowSelectToolTip(false);
            }
        });
        updateQuillSizing();
    }

    useEffect(() => {
        if(data) {
            setFormData(data);
            setSongLyrics(data.lyrics);
            setLyricsReady(true);
            console.log("ready");
        }
        else if(props.editSong) {
            setLyricsReady(false);
        }
    }, [data]);

    useEffect(() => {
        if(!lyricsReady && !props.editSong) {
            setLyricsReady(true);
        }
        if (lyricsReady) {
            updateQuillSizing();
        }
    }, [lyricsReady]);

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
        if (!props.editSong) {
            setFormData(undefined);
            setSongLyrics(initialLyrics);
            setLyricsReady(false);
        }
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
        // <QuillLoadingContext.Provider value={setLoading}>
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
                    <AnimateHeight
                        animateOpacity
                        duration={300}
                        height={formData?.title && formData?.artist ? "auto" : 0}
                    >
                        <Whisper placement="bottomStart" ref={geniusWhisperRef} trigger="none" speaker={renderGeniusSong({
                                title: formData?.title ? formData?.title : '',
                                artist: formData?.artist ? formData?.artist : '',
                                onConfirm: (newLyrics: string) => {
                                    if(quillInstance.current) {
                                        //quillInstance.current.clipboard.dangerouslyPasteHTML(newLyrics);
                                        quillInstance.current.root.innerHTML = newLyrics;
                                    }
                                }
                            })}
                        >
                            <Button appearance="primary" style={{
                                color: 'black',
                                backgroundColor: '#ffff7d'
                            }} onClick={(e) => {
                                if (geniusWhisperRef.current) {
                                    geniusWhisperRef.current.open();
                                }
                            }} >
                                    <SiGenius style={{marginRight: '1em'}} />
                                    Get Lyrics From &nbsp;
                                    <strong style={{
                                        color: '#ffff38',
                                        textShadow: '-1px 1px 1px black',
                                        letterSpacing: 4,
                                        marginBottom: 4
                                    }}>
                                        GENIUS
                                    </strong>
                            </Button>
                        </Whisper>
                     
                    </AnimateHeight>
                    <div style={{
                        position: 'relative',
                        marginTop: '1em',
                        height: '50vh',
                        border: '3px solid #150080',
                        //overflow: 'hidden',
                    }} >
                        <ReactQuill
                            // style={{
                            //     height: `calc(100% - ${quillOffset}px)`,
                            // }}
                            initQuill={initQuill}
                            initQuillInstance={initQuillInstance}
                            initialReady={lyricsReady}
                            initialText={songLyrics}
                            options={{theme: 'snow', formats: quillSongFormats, modules: quillSongModules}}
                        />
                        <QuillSelectToolTip show={showSelectToolTip}
                            style={{
                                ...selectToolTipPosition
                            }}
                            onConfirm={() => {
                                (chordToolbarButton as HTMLButtonElement).click();
                                setShowSelectToolTip(false);
                            }}
                        />
                        <QuillChordToolTip show={showChordToolTip}
                            style={{
                                ...chordToolTipPosition
                            }}
                            onConfirm={(value) => {
                                chordToolTipOnConfirm.current(value);
                            }}
                            onClose={() => {
                                setShowChordToolTip(false);
                                chordToolTipOnClose.current();
                            }}
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
        // </QuillLoadingContext.Provider>
    )
}

export default SongModal;

    // useEffect(() => {
    //     import('react-quill').then((mod) => {
    //         const { Quill } = mod.default;
    //         addChordFormat(Quill);
    //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //         // @ts-ignore
    //         setQuillModules({
    //             toolbar: {
    //                 container: quillModules.toolbar.container,
    //                 // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //                 // @ts-ignore
    //                 handlers: {
    //                     'chord': function (this: {quill:any}) {
    //                         const range = this.quill.getSelection();
    //                         const selectedText = this.quill.getText(range);
    //                         if (!selectedText.includes('\n')) {
    //                             const bounds = this.quill.getBounds(this.quill.getSelection());
    //                             const format = this.quill.getFormat(range);
    //                             if (('chord' in format)) {
    //                                 const value = format.chord;
    //                                 const chordId = generateChordId(value.chord, value.index, value.length);
    //                                 // this.quill.formatText(range, {
    //                                 //     ...format,
    //                                 //     chord: null
    //                                 // });
    //                                 //this.quill.removeFormat(range);
    //                                 const chordElement = document.getElementsByClassName(chordId)[0];
    //                                 chordElement.outerHTML = chordElement.innerHTML;
    //                             }
    //                             else {
    //                                 // highlight selected text
    //                                 if (('chordHighlight' in format)) {
    //                                     this.quill.formatText(range, {
    //                                         chordHighlight: null
    //                                     });
    //                                 }
    //                                 else {
    //                                     this.quill.formatText(range, {
    //                                         chordHighlight: true,
    //                                     });
    //                                 }
    //                                 chordToolTipOnClose.current = () => {
    //                                     this.quill.formatText(range, {
    //                                         chordHighlight: null
    //                                     });
    //                                 }
    //                                 // open tooltip and get input
    //                                 const toolbar = document.getElementsByClassName('ql-toolbar ql-snow')[0];
    //                                 const editor = Array.from(document.getElementsByClassName('ql-editor')).filter((e) => e.getAttribute("contenteditable") == "true")[0] as HTMLElement;
    //                                 editor.onscroll = function (e) {
    //                                     if (updateChordToolTip.current) {
    //                                         window.requestAnimationFrame(function() {
    //                                             const diff = editor.scrollTop - quillEditorScrollTop.current;
    //                                             quillEditorScrollTop.current = editor.scrollTop;
    //                                             setChordToolTipPosition((previousValue) => { return {
    //                                                 ...previousValue,
    //                                                 top: previousValue.top - diff,
    //                                             }})
    //                                             updateChordToolTip.current = true;
    //                                         });
    //                                         updateChordToolTip.current = false;
    //                                     }
    //                                 }
    //                                 setShowChordToolTip(true);
    //                                 setChordToolTipPosition({
    //                                     top: 5 + bounds.top + bounds.height + (toolbar ? toolbar.clientHeight : 0),
    //                                     left: bounds.left
    //                                 })
    //                                 chordToolTipOnConfirm.current = (chord: string) => {
    //                                     this.quill.removeFormat(range);
    //                                     this.quill.formatText(range, {
    //                                         chord: {
    //                                             chord,
    //                                             index: range.index,
    //                                             length: range.length
    //                                         }
    //                                     });
    //                                 };
    //                             }
    //                         }
    //                         else {
    //                             setShowChordToolTip(false);
    //                         }
    //                     }
    //                 }
    //             }
    //         });

    //     });
    // }, []);


                        {/* <ReactQuill
                            style={{
                                height: `calc(100% - ${quillToolbarElement ? quillToolbarElement.clientHeight : 0}px)`,
                            }}
                            readOnly={pauseModal} theme="snow" modules={quillModules} formats={quillSongFormats}
                            value={songLyrics} onChange={(content, delta, source, editor) => {
                                console.log('change')
                                console.log(songLyrics)
                                console.log(content)
                                setSongLyrics(content);
                                // When entering a newline, the chord formatting will cause bugs and crashes.
                                // Hence, the chord formatting is removed for the new empty line.
                                if (delta.ops && delta.ops.filter((op) => {
                                        return "insert" in op && op.insert == '\n'
                                    }).length > 0)
                                {
                                    const removeChordSpan = () => {
                                        setTimeout(() => {
                                            const parent = window.getSelection()?.anchorNode?.parentElement?.parentElement;
                                            if (parent && parent.tagName == 'SPAN' && parent.hasAttribute('data-chord')) {
                                                parent.outerHTML = parent.innerHTML;
                                                removeChordSpan();
                                            }
                                        }, 0);
                                    }
                                    removeChordSpan();
                                }
                                // When deleting a newline, a ql-cursor may appear if there's a chord formatting enabled.
                                // When a space is pressed, a crash will occur. Hence, ql-cursor must be removed.
                                if (delta.ops && delta.ops.filter((op) => {
                                    return "delete" in op
                                }).length > 0)
                                {
                                    Array.from(document.getElementsByClassName('ql-cursor')).forEach((el) => {
                                        el.remove();
                                    })
                                }
                            }}
                            onChangeSelection={(range: {index: number, length: number}, source, editor) => {
                                if (range && range.length > 0 && !editor.getText(range.index, range.length).includes('\n')) {
                                    const bounds = editor.getBounds(range.index, range.length);
                                    setShowSelectToolTip(true);
                                    setSelectToolTipPosition({
                                        top: 8 + bounds.top + bounds.height + (quillToolbarElement ? quillToolbarElement.clientHeight : 0),
                                        left: bounds.left
                                    });
                                }
                                else {
                                    setShowSelectToolTip(false);
                                }
                            }}
                        /> */}




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