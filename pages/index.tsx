import { useState } from 'react'
import { NextPage } from 'next'
import { Container, Button, Stack, Divider, IconButton } from 'rsuite';
import Head from '../components/Head'
import Footer from '../components/Footer'
import SessionCard from '../components/SessionCard'
import SessionModal from '../components/SessionModal'
import { SessionProps, PageName } from '../components/types'
import { isPresentOrFutureDate } from '../lib/utils'
import { Plus, More } from '@rsuite/icons'

//import Image from 'next/image'

const HomePage: NextPage = () => {
  
  const [addSessionShow, setAddSessionShow] = useState<boolean>(false);
  const [editSessionShow, setEditSessionShow] = useState<boolean>(false);
  const [editSessionId, setEditSessionId] = useState<number|undefined>(undefined);

  const data : SessionProps[] = [
    {
      //date: new Date(1643012689000),
      date: new Date(),
      songs: ["Come and worship", "Holy spirit come in power"],
      worship_leader: 'Sam Chan',
      vocalist: undefined,
      keyboard: undefined,
      guitar: undefined,
      drums: undefined,
      sound_personnel: undefined,
    },
    {
      date: new Date(1643012680000),
      songs: [],
      worship_leader: 'Vincent Foo',
      vocalist: undefined,
      keyboard: undefined,
      guitar: undefined,
      drums: undefined,
      sound_personnel: undefined,
    },
    {
      date: new Date(1643012680000),
      songs: [],
      worship_leader: 'Vincent Foo',
      vocalist: undefined,
      keyboard: undefined,
      guitar: undefined,
      drums: undefined,
      sound_personnel: undefined,
    },
    {
      date: new Date(1643012680000),
      songs: [],
      worship_leader: 'Vincent Foo',
      vocalist: undefined,
      keyboard: undefined,
      guitar: undefined,
      drums: undefined,
      sound_personnel: undefined,
    }
  ];

  const handleAddSessionClose = () => {
    setAddSessionShow(false);
  } 

  const handleEditSessionClose = () => {
    setEditSessionShow(false);
  }

  const latestSession = data[0];

  return (
    <Container className='page' >
      <SessionModal visibility={addSessionShow} handleClose={handleAddSessionClose} />
      <SessionModal editSession={editSessionShow} editSessionId={editSessionId} visibility={editSessionShow} handleClose={handleEditSessionClose} />
      <Head title={PageName.Home} description="Home page" />
      <main>
        <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
          <Stack direction='column' spacing="1em" >
            <IconButton appearance="primary" color="green" icon={<Plus />} onClick={() => setAddSessionShow(true)} >
                Add Session
            </IconButton>
            <h2>Latest session</h2>
            {latestSession && isPresentOrFutureDate(latestSession.date) && <SessionCard {...latestSession} />}
            <Divider style={{height: '0.2em', width: '90vw'}} />
            <h2>Previous sessions</h2>
            {latestSession && !isPresentOrFutureDate(latestSession.date) && <SessionCard {...latestSession} />}
            <Stack wrap direction='row' justifyContent='center' spacing="1em" >
              {data.slice(1).map((session, index) => <SessionCard key={index} {...session} />)}
            </Stack>
          </Stack>
        </Stack>
      </main>
      <Footer />
    </Container>
  )
}

export default HomePage
