import { NextPage } from 'next'
import Link from 'next/link'
import { Button, Stack, Divider } from 'rsuite';
import { BsGithub } from 'react-icons/bs'

const ErrorPage: NextPage = () => {

  return (
    <>
      <main>
        <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
          <Stack direction='column' spacing="1em" >
            <h2>Oops!</h2>
            <Divider style={{height: '0.2em', width: '90vw'}} />
            <h4>
              We could not find what you were looking for. 😵
            </h4>
            <Divider style={{height: '0.2em', width: '90vw'}} />
            <Stack wrap direction='row' justifyContent='center' spacing="1em" >
                <Link passHref href="/">
                  <Button appearance="primary" color="blue" >
                    Go to Home
                  </Button>
                </Link>
            </Stack>
          </Stack>
        </Stack>
      </main>
    </>
  )
}

export default ErrorPage
