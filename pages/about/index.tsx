import { NextPage } from 'next'
import { Container, Button, Stack, Divider, Sidebar } from 'rsuite';
import Head from '../../components/Head'
import Footer from '../../components/Footer'
import SessionCard from '../../components/SessionCard'
import { SessionProps, PageName } from '../../components/types'
import { isPresentOrFutureDate } from '../../lib/utils'

//import Image from 'next/image'

const AboutPage: NextPage = () => {


  return (
    <Container className='page' >
      <Head title={PageName.About} description="About page" />
      <main>
        <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
          <Stack direction='column' spacing="1em" >
            <h2>Latest session</h2>
            <Divider style={{height: '0.2em', width: '90vw'}} />
            <h2>Previous sessions</h2>
            <Stack wrap direction='row' justifyContent='center' spacing="1em" >
            </Stack>
          </Stack>
        </Stack>
      </main>
      <Footer />
    </Container>
  )
}

export default AboutPage