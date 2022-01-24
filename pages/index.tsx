import type { NextPage } from 'next'
import { Container, Button, Stack, Divider, Sidebar } from 'rsuite';
import Head from '../components/Head'
import Header from '../components/Header'
import Footer from '../components/Footer'
import SessionCard from '../components/SessionCard'
import { SessionProps } from '../components/types'

//import Image from 'next/image'

const Home: NextPage = () => {

  const data : SessionProps[] = [
    {
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
    }
  ]

  return (
    <Container className='page' >
      <Head title="Home" description="Home page" />
      <main>
        <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
          <Stack direction='column' spacing="1em" >
            {data.length > 0 && <SessionCard {...data[0]} />}
            <Divider style={{height: '0.2em', width: '90vw'}} />
            {data.slice(1).map((session, index) => <SessionCard key={index} {...session} />)}
          </Stack>
        </Stack>
      </main>
      <Footer />
    </Container>
  )
}

export default Home
