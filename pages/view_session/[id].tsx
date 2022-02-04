import { useState, useRef, useEffect } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <Loader content="Loading lyrics..." />
});
import useSWR from 'swr'
import { Stack, Divider, Button, Panel, InputGroup, Input, Dropdown, Loader, Animation } from 'rsuite';
import SessionModal from '../../components/SessionModal'
import ExportSessionModal from '../../components/ExportSessionModal'
import DeleteSessionModal from '../../components/DeleteSessionModal'
import NotFound from '../../components/NotFound'
import { SessionProps, SongProps } from '../../lib/types'
import { domainUrl, copyToClipboard, json_fetcher } from '../../lib/utils'
import { GrCaretPrevious, GrCaretNext, GrFormNext, GrFormView, GrFormViewHide } from 'react-icons/gr'
import { AiOutlineLink, AiOutlineDownCircle, AiOutlineUpCircle } from 'react-icons/ai'
import { FiEdit } from 'react-icons/fi'
import { BiExport } from 'react-icons/bi'
import { RiDeleteBin2Fill } from 'react-icons/ri'
const session_fetcher = json_fetcher('GET');
const songs_fetcher = json_fetcher('GET');

const SessionDetailItem = ({value, placeholder} : {value: string | undefined, placeholder: string | undefined}) => {
    return (
        <InputGroup>
            <InputGroup.Addon>
                {placeholder}
            </InputGroup.Addon>
            <Input
                value={value}
                readOnly={true}
            />
        </InputGroup>
    )
}

const ViewSessionPage: NextPage = () => {
    const router = useRouter()
    const { id } = router.query;
    const session_id = typeof id == 'string' ? parseInt(id) : -1;
    const { data, isValidating, error, mutate } = useSWR(`/api/get_session/${session_id}`, session_fetcher);
    const { data: songsData, isValidating: isValidatingSongs, error: errorSongs } = useSWR(data ? `/api/get_song/${data?.songs}?multiple` : null, songs_fetcher);
    const songArray: SongProps[] = songsData ? songsData : [];

    const [sessionInfoShow, setSessionInfoShow] = useState<boolean>(false);
    const [editSessionShow, setEditSessionShow] = useState<boolean>(false);
    const [exportSessionShow, setExportSessionShow] = useState<boolean>(false);
    const [deleteSessionShow, setDeleteSessionShow] = useState<boolean>(false);
    const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
    const [showSongLyrics, setShowSongLyrics] = useState<boolean>(true);
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (!loaded && !error && data) {
            setLoaded(true)
        }
    }, [data, error])

    const quillEditorRef = useRef<HTMLDivElement>(null);
    const currentSong = songArray[currentSongIndex];

    const handleEditSessionClose = () => {
        setEditSessionShow(false);
    }
    const handleExportSessionClose = () => {
        setExportSessionShow(false);
    }
    const handleDeleteSessionClose = () => {
        setDeleteSessionShow(false);
    }

    const session_data: SessionProps = data ? {
        ...data,
        date: new Date(data.date)
    } : undefined;

    // useEffect(() => {
    //     if (showSongLyrics) {
    //         setTimeout(() => {
    //             if(quillEditorRef.current) {
    //                 quillEditorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest'});
    //             }
    //         }, 100);
    //     }
    // }, [showSongLyrics])

    console.log(error);
    console.log(errorSongs);

    return (
    <>
        <SessionModal editSession={editSessionShow} editSessionId={session_id} visibility={editSessionShow} handleClose={handleEditSessionClose} onSuccess={mutate} />
        <ExportSessionModal sessionData={session_data} visibility={exportSessionShow} handleClose={handleExportSessionClose} />
        <DeleteSessionModal sessionData={session_data} visibility={deleteSessionShow} handleClose={handleDeleteSessionClose} onSuccess={mutate} />
        <main>
            <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' style={{
                width: '100vw'
            }} >
                <Animation.Bounce in={!session_data && isValidating} >
                    <Loader size='md' content="Fetching session..." />
                </Animation.Bounce>
                { loaded && session_data &&
                    <Stack spacing='3em' direction='column' alignItems='center' justifyContent='center' >
                        <Stack direction='column' alignItems='center' justifyContent='center' >
                            <h2 style={{textAlign: 'center'}} >{session_data.date.toDateString()}</h2>
                            <Panel onClick={() => setSessionInfoShow(!sessionInfoShow)} header={
                                <Stack spacing='0.5em' direction='row' alignItems='center' justifyContent='center' >
                                    <SessionDetailItem placeholder="Worship Leader" value={session_data.worship_leader} />
                                    <Button appearance="subtle" color="cyan" onClick={() => setSessionInfoShow(!sessionInfoShow)} >
                                        {sessionInfoShow ? <AiOutlineUpCircle size='1.5em' /> : <AiOutlineDownCircle size='1.5em' />}
                                    </Button>
                                </Stack>
                            } collapsible bordered >
                                <Stack spacing='1em' direction='column' alignItems='flex-start' justifyContent='center' >
                                    <SessionDetailItem placeholder="Vocalist" value={session_data.vocalist} />
                                    <SessionDetailItem placeholder="Keyboardist" value={session_data.keyboard} />
                                    <SessionDetailItem placeholder="Guitarist" value={session_data.guitar} />
                                    <SessionDetailItem placeholder="Drummer" value={session_data.drums} />
                                    <SessionDetailItem placeholder="Sound Personnel" value={session_data.sound_personnel} />
                                </Stack>
                            </Panel>
                        </Stack>
                        <ReactQuill style={{border: '5px solid rgba(28,110,164,0.12)'}} readOnly={true} theme="bubble"
                            value={`<h2><u>Additional Info: </u></h2><hr />${session_data.info ? session_data.info : ''}`}
                        />
                        <Divider style={{height: '0.2em', width: '50vw', marginTop:'0em', marginBottom:'0em'}} />
                        <Stack wrap spacing='1em' direction='row' alignItems='center' justifyContent='center' >
                            <Button appearance="primary" color="blue" onClick={() => setEditSessionShow(true)} >
                                <FiEdit style={{marginRight: '1em'}} />Edit Session
                            </Button>
                            <Button appearance="primary" color="violet" onClick={() => {
                                const url = `https://${domainUrl}/view_song/${session_data.id}`;
                                copyToClipboard(url, 'Copied URL to clipboard');
                            }} >
                                <AiOutlineLink style={{marginRight: '1em'}} />Share Session
                            </Button>
                            <Button appearance="primary" color="orange" onClick={() => setExportSessionShow(true)} >
                                <BiExport style={{marginRight: '1em'}} />Export Session
                            </Button>
                            <Button appearance="primary" color="red" onClick={() => setDeleteSessionShow(true)} >
                                <RiDeleteBin2Fill style={{marginRight: '1em'}} />Delete Session
                            </Button>
                        </Stack>
                        <Divider style={{height: '0.2em', width: '50vw', marginTop:'0em', marginBottom:'0em'}} />
                        <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
                            {currentSong &&
                                <>
                                    <Stack direction='row' alignItems='center' justifyContent='center' >
                                        <Button appearance="subtle" disabled={currentSongIndex <= 0}
                                            onClick={() => setCurrentSongIndex(currentSongIndex <= 0 ? currentSongIndex : currentSongIndex - 1)} >
                                                <GrCaretPrevious />
                                        </Button>
                                        <Dropdown activeKey={currentSong} title={`Song ${currentSongIndex + 1}`} onSelect={(eventKey: number) => setCurrentSongIndex(eventKey)} >
                                            {songArray.map((song, index) => (
                                                <Dropdown.Item key={index} eventKey={index}>{song.title} - {song.artist}</Dropdown.Item>
                                            ))}
                                        </Dropdown>
                                        <Button appearance="subtle" disabled={currentSongIndex + 1 >= songArray.length}
                                            onClick={() => setCurrentSongIndex((currentSongIndex + 1 >= songArray.length) ? currentSongIndex : currentSongIndex + 1)} >
                                                <GrCaretNext />
                                        </Button>
                                    </Stack>
                                    <Stack spacing='0.5em' direction='column' alignItems='center' justifyContent='center' >
                                        <h2 style={{textAlign: 'center'}} >{currentSong.title} - {currentSong.artist}</h2>
                                        <Stack wrap spacing='1em' direction='row' alignItems='center' justifyContent='center' >
                                            <Button appearance="ghost" onClick={() => router.push(`/view_song/${currentSong.id}`)} >
                                                <GrFormNext style={{marginRight: '1em'}} />More Details
                                            </Button>
                                            <Button appearance="ghost" onClick={() => {
                                                setShowSongLyrics(!showSongLyrics);
                                                if (!showSongLyrics) {
                                                    setTimeout(() => {
                                                        if(quillEditorRef.current) {
                                                            quillEditorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest'});
                                                        }
                                                    }, 300);
                                                }
                                            }} >
                                                {showSongLyrics ? <GrFormView style={{marginRight: '1em'}} /> : <GrFormViewHide style={{marginRight: '1em'}} />}
                                                Lyrics
                                            </Button>
                                        </Stack>
                                        <Animation.Collapse in={showSongLyrics} >
                                            <div>
                                            <div ref={quillEditorRef} >
                                                <ReactQuill style={{border: '5px solid rgba(28,110,164,0.12)'}} readOnly={true} theme="bubble" value={currentSong.lyrics} />
                                            </div>
                                            </div>
                                        </Animation.Collapse>
                                    </Stack>
                                </>
                            }
                            {!currentSong &&
                                <h2>No songs.</h2>
                            }
                            
                        </Stack>
                    </Stack>
                }
                { (!isValidating && !loaded) &&
                    <NotFound message="We could not find this session." redirectLink="/" redirectMessage='Back to Home' />
                }
            </Stack>
        </main>
    </>
    )
}

export default ViewSessionPage
