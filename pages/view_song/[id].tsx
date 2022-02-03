import { useState, useEffect } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <Loader content="Loading lyrics..." />
});
import useSWR from 'swr'
import { Stack, Divider, Button, Loader, Animation } from 'rsuite';
import SongModal from '../../components/SongModal'
import ExportSongModal from '../../components/ExportSongModal'
import DeleteSongModal from '../../components/DeleteSongModal'
import NotFound from '../../components/NotFound'
import { domainUrl, copyToClipboard, json_fetcher } from '../../lib/utils'
import { AiOutlineLink } from 'react-icons/ai'
import { FiEdit } from 'react-icons/fi'
import { BiExport } from 'react-icons/bi'
import { RiDeleteBin2Fill } from 'react-icons/ri'
const song_fetcher = json_fetcher('GET');

const YouTubeSong = ({keyword}: {keyword: string}) => {
    const { data, isValidating, error } = useSWR(`/api/search_youtube/?keyword=${keyword}`, song_fetcher);
    const embedId = data;
    return (
        <>
        { data ? 
            <div style={{width: '90vw', height: '90vh', padding: '2em'}} >
                <div className="video-responsive"  >
                    <iframe
                        src={`https://www.youtube.com/embed/${embedId}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Embedded YouTube"
                    />
                </div>
            </div>
            :
            <Loader size='md' content="Searching YouTube..." />
        }
        </>
    )
}

const ViewSongPage: NextPage = () => {
    const router = useRouter()
    const { id } = router.query;
    const song_id = typeof id == 'string' ? parseInt(id) : -1;
    const { data, isValidating, error, mutate } = useSWR(`/api/get_song/${song_id}`, song_fetcher);
    const [editSongShow, setEditSongShow] = useState<boolean>(false);
    const [exportSongShow, setExportSongShow] = useState<boolean>(false);
    const [deleteSongShow, setDeleteSongShow] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (!loaded && !error && data) {
            setLoaded(true)
        }
    }, [data, error])

    const handleEditSongClose = () => {
        setEditSongShow(false);
    }
    const handleExportSongClose = () => {
        setExportSongShow(false);
    }
    const handleDeleteSongClose = () => {
        setDeleteSongShow(false);
    }

    const song_data = data;

    return (
    <>
        <SongModal editSong={editSongShow} editSongId={song_id} visibility={editSongShow} handleClose={handleEditSongClose} onSuccess={mutate} />
        <ExportSongModal songData={song_data} visibility={exportSongShow} handleClose={handleExportSongClose} />
        <DeleteSongModal songData={song_data} visibility={deleteSongShow} handleClose={handleDeleteSongClose} onSuccess={mutate} />
        <main>
            <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' style={{
                width: '100vw'
            }} >
                <Animation.Bounce in={!song_data && isValidating} >
                    <Loader size='md' content="Fetching song..." />
                </Animation.Bounce>
                { loaded && song_data &&
                    <Stack spacing='3em' direction='column' alignItems='center' justifyContent='center' >
                        <Stack direction='column' alignItems='center' justifyContent='center' >
                            <h2 style={{textAlign: 'center'}} >{song_data.title}</h2>
                            <Divider style={{height: '0.2em', width: '50vw', marginTop:'0.3em', marginBottom:'0.3em'}} />
                            <h4 style={{textAlign: 'center'}} >{song_data.artist}</h4>
                        </Stack>
                        <Stack wrap spacing='1em' direction='row' alignItems='center' justifyContent='center' >
                            <Button appearance="primary" color="blue" onClick={() => setEditSongShow(true)} >
                                <FiEdit style={{marginRight: '1em'}} />Edit Song
                            </Button>
                            <Button appearance="primary" color="violet" onClick={() => {
                                const url = `${domainUrl}/view_song/${song_data.id}`;
                                copyToClipboard(url, 'Copied URL to clipboard');
                            }} >
                                <AiOutlineLink style={{marginRight: '1em'}} />Share Song
                            </Button>
                            <Button appearance="primary" color="orange" onClick={() => setExportSongShow(true)} >
                                <BiExport style={{marginRight: '1em'}} />Export Song
                            </Button>
                            <Button appearance="primary" color="red" onClick={() => setDeleteSongShow(true)} >
                                <RiDeleteBin2Fill style={{marginRight: '1em'}} />Delete Song
                            </Button>
                        </Stack>
                        <ReactQuill style={{border: '5px solid rgba(28,110,164,0.12)'}} readOnly={true} theme="bubble" value={song_data.lyrics} />
                        <YouTubeSong keyword={`${song_data.title} - ${song_data.artist}`} />
                    </Stack>
                }
                { (!isValidating && !loaded) &&
                    <NotFound message="We could not find this song." redirectLink="/all_songs" redirectMessage='View all songs' />
                }
            </Stack>
        </main>
    </>
    )
}

export default ViewSongPage
