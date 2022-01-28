import { useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Container, Stack, Divider, IconButton, Loader, Animation } from 'rsuite';
import Head from '../../components/Head'
import Footer from '../../components/Footer'
import SessionCard from '../../components/SessionCard'
import SessionModal from '../../components/SessionModal'
import DeleteSessionModal from '../../components/DeleteSessionModal'
import { SessionProps, PageName } from '../../components/types'
import { getDomainUrl, copyToClipboard, json_fetcher, isPresentOrFutureDate } from '../../lib/utils'
import { Plus } from '@rsuite/icons'
const domain_url = getDomainUrl();
const sessions_fetcher = json_fetcher('GET');

const ViewSessionPage: NextPage = () => {
  
  const [searchText, setSearchText] = useState<string>('');
  const [lastSessionId, setLastSessionId] = useState<number>(0);
  //const { data, isValidating, error, mutate } = useSWR(`/api/get_sessions?lastSessionId=${lastSessionId}&searchText=${searchText}`, sessions_fetcher);


  return (
    <Container className='page' >
      <Head title={PageName.ViewSession} description="Home page which displays all sessions" />
      <main>
        <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
        </Stack>
      </main>
      <Footer />
    </Container>
  )
}

export default ViewSessionPage
