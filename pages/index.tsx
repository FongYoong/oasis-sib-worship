import { useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Container, Stack, Divider, IconButton, Loader, Animation, Button } from 'rsuite';
import Head from '../components/Head'
import Footer from '../components/Footer'
import SessionCard from '../components/SessionCard'
import SessionModal from '../components/SessionModal'
import ExportSessionModal from '../components/ExportSessionModal'
import DeleteSessionModal from '../components/DeleteSessionModal'
import { SessionProps, PageName } from '../lib/types'
import { domainUrl, copyToClipboard, json_fetcher, isPresentOrFutureDate } from '../lib/utils'
import { Plus } from '@rsuite/icons'
import { MdExpandMore } from 'react-icons/md'
const sessions_fetcher = json_fetcher('GET');

const HomePage: NextPage = () => {
  
  const [searchText, setSearchText] = useState<string>('');
  const [pageIndex, setPageIndex] = useState<number>(1);

  const { data, isValidating, error, mutate } = useSWR(`/api/get_sessions?page=1&searchText=${searchText}`, sessions_fetcher);

  const [addSessionShow, setAddSessionShow] = useState<boolean>(false);
  const [editSessionShow, setEditSessionShow] = useState<boolean>(false);
  const [editSessionId, setEditSessionId] = useState<number|undefined>(undefined);
  const [exportSessionShow, setExportSessionShow] = useState<boolean>(false);
  const [exportSessionData, setExportSessionData] = useState<SessionProps|undefined>(undefined);
  const [deleteSessionShow, setDeleteSessionShow] = useState<boolean>(false);
  const [deleteSessionData, setDeleteSessionData] = useState<SessionProps|undefined>(undefined);

  const handleAddSessionClose = () => {
    setAddSessionShow(false);
}
  const handleEditSessionClose = () => {
    setEditSessionShow(false);
  }
  const handleExportSessionClose = () => {
    setExportSessionShow(false);
  }
  const handleDeleteSessionClose = () => {
    setDeleteSessionShow(false);
  }

  const handleSessionMenuSelect = (eventKey?: string, session_data?: SessionProps) => {
    if (session_data) {
        if (eventKey == 'edit') {
            setEditSessionShow(true)
            setEditSessionId(session_data?.id)
        }
        else if (eventKey == 'share') {
            const url = `${domainUrl}/view_session/${session_data.id}`;
            copyToClipboard(url, 'Copied URL to clipboard');
        }
        else if (eventKey == 'export') {
          setExportSessionShow(true)
          setExportSessionData(session_data)
        }
        else if (eventKey == 'delete') {
            setDeleteSessionShow(true)
            setDeleteSessionData(session_data)
        }
    }
  };

  const GenerateSessionCard = ({session}: {session: SessionProps}) => {
    const router = useRouter();
    return (
      <SessionCard {...session}
        handleSessionMenuSelect={handleSessionMenuSelect}
        onClick={(event: React.MouseEvent<Element, MouseEvent>) => {
          if (!['BUTTON', 'svg', 'LI'].includes((event.target as Element).nodeName)) {
            router.push(`/view_session/${session.id}`);
          }
          else {
            event.stopPropagation();
          }
        }}
      />
    )
  };

  const PreviousSessions = ({index}: {index: number}) => {
    const { data, isValidating, error, mutate } = useSWR(`/api/get_sessions?page=${index}`, sessions_fetcher);
    const sessions = data ? data.sessions.map((session: { date: string, songs: string, id: string }) => {
      return {
          ...session,
          date: new Date(session.date),
          songs: session.songs
      }
    }) : [];
    console.log(sessions)
    return (
        data ? sessions.map((session_data: SessionProps) => <GenerateSessionCard key={index} session={session_data} />): <></>
    )
  }

  const previousSessionPages = [];
  for (let i = 2; i <= pageIndex; i++) {
    previousSessionPages.push(<PreviousSessions index={i} key={i} />)
  }
  
  //const maxItemsPerPage: number = data ? data.maxItemsPerPage : 0;
  const totalPages: number = data ? data.totalPages : 0;
  console.log(pageIndex)
  console.log(totalPages)
  const processed_data = data ? data.sessions.map((session: { date: string, songs: string, id: string }) => {
      return {
          ...session,
          date: new Date(session.date),
          songs: session.songs
      }
  }) : [];
  const upcoming_sessions = processed_data.filter((session: SessionProps) => isPresentOrFutureDate(session.date));
  const past_sessions = processed_data.filter((session: SessionProps) => !isPresentOrFutureDate(session.date));

  return (
    <Container className='page' >
      <SessionModal visibility={addSessionShow} handleClose={handleAddSessionClose} onSuccess={mutate} />
      <SessionModal editSession={editSessionShow} editSessionId={editSessionId} visibility={editSessionShow} handleClose={handleEditSessionClose} onSuccess={mutate} />
      <ExportSessionModal sessionData={exportSessionData} visibility={exportSessionShow} handleClose={handleExportSessionClose} />
      <DeleteSessionModal sessionData={deleteSessionData} visibility={deleteSessionShow} handleClose={handleDeleteSessionClose} onSuccess={mutate} />
      <Head title={PageName.Home} description="Home page which displays all sessions" />
      <main>
        <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
          <Animation.Bounce in={isValidating} >
            <Loader size='md' content="Fetching sessions..." />
          </Animation.Bounce>
          <Stack direction='column' spacing="1em" alignItems='center' justifyContent='center' >
            <IconButton disabled={isValidating} appearance="primary" color="green" icon={<Plus />} onClick={() => setAddSessionShow(true)} >
                Add Session
            </IconButton>
            <h2>Upcoming sessions</h2>
            <Animation.Bounce in={processed_data} >
              <Stack wrap direction='row' justifyContent='center' spacing="2em" >
                  {upcoming_sessions && upcoming_sessions.map((session: SessionProps) => 
                    <GenerateSessionCard key={session.id} session={session} />
                  )}
              </Stack>
            </Animation.Bounce>
            <Divider style={{height: '0.2em', width: '90vw'}} />
            <h2>Previous sessions</h2>
            <Animation.Bounce in={processed_data} >
              <Stack wrap direction='row' justifyContent='center' spacing="2em" >
                  {past_sessions && past_sessions.map((session: SessionProps) => 
                    <GenerateSessionCard key={session.id} session={session} />
                  )}
                  {previousSessionPages}
              </Stack>
            </Animation.Bounce>
            { (pageIndex < totalPages) && 
              <Button appearance="primary" color="violet" onClick={() => {setPageIndex(pageIndex + 1)}} >
                    <MdExpandMore style={{marginRight: '1em'}} />More
              </Button>
            }
          </Stack>
        </Stack>
      </main>
      <Footer />
    </Container>
  )
}

export default HomePage
