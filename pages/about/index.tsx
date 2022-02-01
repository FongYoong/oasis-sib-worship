import { NextPage } from 'next'
import Link from 'next/link'
import { Container, Button, Stack, Divider, Sidebar } from 'rsuite';
import Head from '../../components/Head'
import Footer from '../../components/Footer'
import { PageName } from '../../lib/types'
import { BsGithub } from 'react-icons/bs'

const AboutPage: NextPage = () => {

  return (
    <Container className='page' >
      <Head title={PageName.About} description="About page" />
      <main>
        <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
          <Stack direction='column' spacing="1em" >
            <h2>What is this for?</h2>
            <Divider style={{height: '0.2em', width: '90vw'}} />
            <h2>How to use?</h2>
            <p>
              The <Link href="/"><a>Home</a></Link> page
            </p>
            <Divider style={{height: '0.2em', width: '90vw'}} />
            <Stack wrap direction='row' justifyContent='center' spacing="1em" >
              <Button appearance="primary" color="blue" onClick={() => {
                  window.open("https://github.com/FongYoong/oasis-sib-worship", '_blank')
                }} >
                  <BsGithub style={{marginRight: '1em'}} />GitHub
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </main>
      <Footer />
    </Container>
  )
}

export default AboutPage
