import { NextPage } from 'next'
import { Stack } from 'rsuite';
import NotFound from '../components/NotFound'

const ErrorPage: NextPage = () => {

  return (
    <>
      <main>
        <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
          <Stack direction='column' spacing="1em" >
            <NotFound message='We could not find what you were looking for.' redirectLink='/' redirectMessage='Go to Home' />
          </Stack>
        </Stack>
      </main>
    </>
  )
}

export default ErrorPage
