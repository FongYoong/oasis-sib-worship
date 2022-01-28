import { useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Container, Stack, Divider, IconButton, Loader, Animation } from 'rsuite';
import Head from '../components/Head'
import Footer from '../components/Footer'
import SessionCard from '../components/SessionCard'
import SessionModal from '../components/SessionModal'
import DeleteSessionModal from '../components/DeleteSessionModal'
import { SessionProps, PageName } from '../components/types'
import { getDomainUrl, copyToClipboard, json_fetcher, isPresentOrFutureDate } from '../lib/utils'
import { Plus } from '@rsuite/icons'
const domain_url = getDomainUrl();
const sessions_fetcher = json_fetcher('GET');

const HomePage: NextPage = () => {
  
  const [searchText, setSearchText] = useState<string>('');
  const [lastSessionId, setLastSessionId] = useState<number>(0);
  const { data, isValidating, error, mutate } = useSWR(`/api/get_sessions?lastSessionId=${lastSessionId}&searchText=${searchText}`, sessions_fetcher);

  const [addSessionShow, setAddSessionShow] = useState<boolean>(false);
  const [editSessionShow, setEditSessionShow] = useState<boolean>(false);
  const [editSessionId, setEditSessionId] = useState<number|undefined>(undefined);
  const [deleteSessionShow, setDeleteSessionShow] = useState<boolean>(false);
  const [deleteSessionData, setDeleteSessionData] = useState<SessionProps|undefined>(undefined);

  const handleAddSessionClose = () => {
    setAddSessionShow(false);
}
  const handleEditSessionClose = () => {
    setEditSessionShow(false);
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
            const url = `${domain_url}/view_session/${session_data.id}`;
            copyToClipboard(url, 'Copied URL to clipboard');
        }
        else if (eventKey == 'export') {
            // Export modal
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
            //setEditSessionShow(true)
            //setEditSessionId(session.id)
            router.push(`/view_session/${session.id}`);
          }
          else {
            event.stopPropagation();
          }
        }}
/*         deleteOnClick={(event: React.MouseEvent<Element, MouseEvent>) => {
          event.stopPropagation();
          setDeleteSessionShow(true)
          setDeleteSessionData(session)
        }} */
      />
    )
  };
  
  const processed_data = data ? data.map((session: { date: string, songs: string, id: string }) => {
      return {
          ...session,
          date: new Date(session.date),
          songs: session.songs
      }
  }) : [];
  const upcoming_sessions = processed_data.filter((session: SessionProps) => isPresentOrFutureDate(session.date));
  const past_sessions = processed_data.filter((session: SessionProps) => !isPresentOrFutureDate(session.date));
  //console.log(upcoming_sessions)
  //console.log(past_sessions)
  //console.log(processed_data);

  return (
    <Container className='page' >
      <SessionModal visibility={addSessionShow} handleClose={handleAddSessionClose} onSuccess={mutate} />
      <SessionModal editSession={editSessionShow} editSessionId={editSessionId} visibility={editSessionShow} handleClose={handleEditSessionClose} onSuccess={mutate} />
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
            {/* {latestSession && isPresentOrFutureDate(latestSession.date) && <GenerateSessionCard session={latestSession} /> } */}
            <Animation.Bounce in={processed_data} >
              <Stack wrap direction='row' justifyContent='center' spacing="1em" >
                  {upcoming_sessions && upcoming_sessions.map((session: SessionProps, index: number) => 
                    <GenerateSessionCard key={index} session={session} />
                  )}
              </Stack>
            </Animation.Bounce>
            <Divider style={{height: '0.2em', width: '90vw'}} />
            <h2>Previous sessions</h2>
            {/* {latestSession && !isPresentOrFutureDate(latestSession.date) && <GenerateSessionCard session={latestSession} /> } */}
            <Animation.Bounce in={processed_data} >
              <Stack wrap direction='row' justifyContent='center' spacing="1em" >
                  {past_sessions && past_sessions.map((session: SessionProps, index: number) => 
                    <GenerateSessionCard key={index} session={session} />
                  )}
              </Stack>
            </Animation.Bounce>
          </Stack>
        </Stack>
      </main>
      <Footer />
    </Container>
  )
}

export default HomePage
