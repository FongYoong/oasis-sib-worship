import { useState, useRef } from 'react'
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
import { SessionProps, SongProps } from '../../lib/types'
import { domainUrl, copyToClipboard, json_fetcher } from '../../lib/utils'
import { GrAddCircle, GrSubtractCircle, GrFormNext, GrFormView, GrFormViewHide } from 'react-icons/gr'
import { AiOutlineLink, AiOutlineDownCircle, AiOutlineUpCircle } from 'react-icons/ai'
import { FiEdit } from 'react-icons/fi'
import { BiExport } from 'react-icons/bi'
import { RiDeleteBin2Fill } from 'react-icons/ri'
import { useEffect } from 'react';
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
    const [showSongLyrics, setShowSongLyrics] = useState<boolean>(false);
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

    useEffect(() => {
        if (showSongLyrics) {
            console.log(quillEditorRef.current)
            setTimeout(() => {
                if(quillEditorRef.current) {
                    quillEditorRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest'});
                }
            }, 100);
            
        }
    }, [showSongLyrics])

    console.log(error);
    console.log(errorSongs);

    return (
    <>
        <SessionModal editSession={editSessionShow} editSessionId={session_id} visibility={editSessionShow} handleClose={handleEditSessionClose} onSuccess={mutate} />
        <ExportSessionModal sessionData={session_data} visibility={exportSessionShow} handleClose={handleExportSessionClose} />
        <DeleteSessionModal sessionData={session_data} visibility={deleteSessionShow} handleClose={handleDeleteSessionClose} onSuccess={mutate} />
        <main>
            <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
                { session_data &&
                    <Animation.Bounce in={true} >
                         <Stack spacing='3em' direction='column' alignItems='center' justifyContent='center' >
                            <Stack direction='column' alignItems='center' justifyContent='center' >
                                <h3 style={{textAlign: 'center'}} >{session_data.date.toDateString()}</h3>
                                <Divider style={{height: '0.2em', width: '50vw', marginTop:'0.3em', marginBottom:'0.3em'}} />
                                {/*  */}
                                <Panel onClick={() => setSessionInfoShow(!sessionInfoShow)} header={
                                    <Stack spacing='0.5em' direction='row' alignItems='center' justifyContent='center' >
                                        <SessionDetailItem placeholder="Worship Leader" value={session_data.worship_leader} />
                                        <Button appearance="subtle" color="cyan" onClick={() => setSessionInfoShow(!sessionInfoShow)} >
                                            {sessionInfoShow ? <AiOutlineUpCircle /> : <AiOutlineDownCircle />}
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
                            <Stack wrap spacing='1em' direction='row' alignItems='center' justifyContent='center' >
                                <Button appearance="primary" color="blue" onClick={() => setEditSessionShow(true)} >
                                    <FiEdit style={{marginRight: '1em'}} />Edit Session
                                </Button>
                                <Button appearance="primary" color="violet" onClick={() => {
                                    const url = `${domainUrl}/view_song/${session_data.id}`;
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
                                <Stack direction='row' alignItems='center' justifyContent='center' >
                                    <Button appearance="subtle" disabled={currentSongIndex <= 0}
                                        onClick={() => setCurrentSongIndex(currentSongIndex <= 0 ? currentSongIndex : currentSongIndex - 1)} >
                                            <GrSubtractCircle />
                                    </Button>
                                    <Dropdown activeKey={currentSong} title={`Song ${currentSongIndex + 1}`} onSelect={(eventKey: number) => setCurrentSongIndex(eventKey)} >
                                        {songArray.map((song, index) => (
                                            <Dropdown.Item key={index} eventKey={index}>{song.title} - {song.artist}</Dropdown.Item>
                                        ))}
                                    </Dropdown>
                                    <Button appearance="subtle" disabled={currentSongIndex + 1 >= songArray.length}
                                        onClick={() => setCurrentSongIndex((currentSongIndex + 1 >= songArray.length) ? currentSongIndex : currentSongIndex + 1)} >
                                            <GrAddCircle />
                                    </Button>
                                </Stack>
                                
                                {currentSong &&
                                    <Stack spacing='0.5em' direction='column' alignItems='center' justifyContent='center' >
                                        <h2 style={{textAlign: 'center'}} >{currentSong.title} - {currentSong.artist}</h2>
                                        <Stack wrap spacing='1em' direction='row' alignItems='center' justifyContent='center' >
                                            <Button appearance="ghost" onClick={() => router.push(`/view_song/${currentSong.id}`)} >
                                                <GrFormNext style={{marginRight: '1em'}} />More Details
                                            </Button>
                                            <Button appearance="ghost" onClick={() => setShowSongLyrics(!showSongLyrics)} >
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
                                }
                                {!currentSong &&
                                    <h2>No songs.</h2>
                                }
                                
                            </Stack>
                        </Stack>
                    </Animation.Bounce>
                }
                {
                    !session_data && <Loader size='md' content="Fetching session..." />
                }
            </Stack>
        </main>
    </>
    )
}

export default ViewSessionPage
