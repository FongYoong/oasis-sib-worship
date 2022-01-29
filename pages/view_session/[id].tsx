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
import SongModal from '../../components/SessionModal'
import ExportSessionModal from '../../components/ExportSessionModal'
import DeleteSessionModal from '../../components/DeleteSessionModal'
import { SessionProps, SongProps, PageName } from '../../lib/types'
import { domainUrl, copyToClipboard, json_fetcher } from '../../lib/utils'
import { AiOutlineLink } from 'react-icons/ai'
import { BsFillInfoCircleFill } from 'react-icons/bs'
import { FiEdit } from 'react-icons/fi'
import { BiExport } from 'react-icons/bi'
import { RiDeleteBin2Fill } from 'react-icons/ri'
import SessionModal from '../../components/SessionModal';
const session_fetcher = json_fetcher('GET');

const ViewSessionPage: NextPage = () => {
    const router = useRouter()
    const { id } = router.query;
    const session_id = typeof id == 'string' ? parseInt(id) : -1;
    const { data, isValidating, error, mutate } = useSWR(`/api/get_session/${session_id}`, session_fetcher);
    const [sessionInfoShow, setSessionInfoShow] = useState<boolean>(false);
    const [editSessionShow, setEditSessionShow] = useState<boolean>(false);
    const [exportSessionShow, setExportSessionShow] = useState<boolean>(false);
    const [deleteSessionShow, setDeleteSessionShow] = useState<boolean>(false);

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
    console.log(session_data)
    console.log(error);

    return (
    <Container className='page' >
        <SessionModal editSession={editSessionShow} editSessionId={session_id} visibility={editSessionShow} handleClose={handleEditSessionClose} onSuccess={mutate} />
        <ExportSessionModal sessionData={session_data} visibility={exportSessionShow} handleClose={handleExportSessionClose} />
        <DeleteSessionModal sessionData={session_data} visibility={deleteSessionShow} handleClose={handleDeleteSessionClose} onSuccess={mutate} />
        <Head title={PageName.ViewSong} description="Page for a specified session" />
        <main>
            <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
                { session_data &&
                    <Animation.Bounce in={true} >
                         <Stack spacing='3em' direction='column' alignItems='center' justifyContent='center' >
                            <Stack direction='column' alignItems='center' justifyContent='center' >
                                <h3 style={{textAlign: 'center'}} >{session_data.date.toDateString()}</h3>
                                <Divider style={{height: '0.2em', width: '50vw', marginTop:'0.3em', marginBottom:'0.3em'}} />
                                <Stack spacing='2em' direction='row' alignItems='center' justifyContent='center' >
                                  <h5 style={{textAlign: 'center'}} >Worship Leader: {session_data.worship_leader}</h5>
                                  <Button appearance="primary" color="cyan" onClick={() => setSessionInfoShow(true)} >
                                    <BsFillInfoCircleFill style={{marginRight: '1em'}} />Info
                                  </Button>
                                </Stack>
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
                            <Stack direction='column' alignItems='center' justifyContent='center' >
                                {/* <ReactQuill style={{border: '5px solid rgba(28,110,164,0.12)'}} readOnly={true} theme="bubble" value={song_data.lyrics} /> */}
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
                    !session_data && <Loader size='md' content="Fetching session..." />
                }
            </Stack>
        </main>
        <Footer />
    </Container>
    )
}

export default ViewSessionPage
