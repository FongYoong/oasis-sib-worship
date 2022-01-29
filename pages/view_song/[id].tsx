import { useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <Loader content="Loading lyrics..." />
});
import useSWR from 'swr'
import { Container, Stack, Divider, Button, InputGroup, Input, Loader, Animation } from 'rsuite';
import Head from '../../components/Head'
import Footer from '../../components/Footer'
import SongModal from '../../components/SongModal'
import ExportSongModal from '../../components/ExportSongModal'
import DeleteSongModal from '../../components/DeleteSongModal'
import { SongProps, PageName } from '../../lib/types'
import { domainUrl, copyToClipboard, json_fetcher } from '../../lib/utils'
import { AiOutlineLink } from 'react-icons/ai'
import { FiEdit } from 'react-icons/fi'
import { BiExport } from 'react-icons/bi'
import { RiDeleteBin2Fill } from 'react-icons/ri'
const song_fetcher = json_fetcher('GET');

const ViewSongPage: NextPage = () => {
    const router = useRouter()
    const { id } = router.query;
    const song_id = typeof id == 'string' ? parseInt(id) : -1;
    const { data, isValidating, error, mutate } = useSWR(`/api/get_song/${song_id}`, song_fetcher);
    const [editSongShow, setEditSongShow] = useState<boolean>(false);
    const [exportSongShow, setExportSongShow] = useState<boolean>(false);
    const [deleteSongShow, setDeleteSongShow] = useState<boolean>(false);

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
    console.log(error);

    return (
    <Container className='page' >
        <SongModal editSong={editSongShow} editSongId={song_id} visibility={editSongShow} handleClose={handleEditSongClose} onSuccess={mutate} />
        <ExportSongModal songData={song_data} visibility={exportSongShow} handleClose={handleExportSongClose} />
        <DeleteSongModal songData={song_data} visibility={deleteSongShow} handleClose={handleDeleteSongClose} onSuccess={mutate} />
        <Head title={PageName.ViewSong} description="Page for a specified song" />
        <main>
            <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
                { song_data &&
                    <Animation.Bounce in={true} >
                         <Stack spacing='3em' direction='column' alignItems='center' justifyContent='center' >
                            <Stack direction='column' alignItems='center' justifyContent='center' >
                                <h3 style={{textAlign: 'center'}} >{song_data.title}</h3>
                                <Divider style={{height: '0.2em', width: '50vw', marginTop:'0.3em', marginBottom:'0.3em'}} />
                                <h5 style={{textAlign: 'center'}} >{song_data.artist}</h5>
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
                            <Stack direction='column' alignItems='center' justifyContent='center' >
                                <ReactQuill style={{border: '5px solid rgba(28,110,164,0.12)'}} readOnly={true} theme="bubble" value={song_data.lyrics} />
                                {/* <InputGroup>
                                    <InputGroup.Addon>
                                        Worship Leader
                                    </InputGroup.Addon>
                                    <Input
                                        name="worship_leader"
                                        placeholder="Worship Leader"
                                        readOnly={true}
                                    />
                                </InputGroup> */}
                            </Stack>
                        </Stack>
                    </Animation.Bounce>
                }
                {
                    !song_data && <Loader size='md' content="Fetching song..." />
                }
            </Stack>
        </main>
        <Footer />
    </Container>
    )
}

export default ViewSongPage
