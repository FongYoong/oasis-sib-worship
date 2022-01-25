//import { useState } from 'react'
import type { NextPage } from 'next'
import { Container, IconButton, Input, InputGroup, Stack, Divider } from 'rsuite';
// , Table, Column, Cell, HeaderCell
import Head from '../../components/Head'
import Footer from '../../components/Footer'
import { PageName } from '../../components/types'
//import { isPresentOrFutureDate } from '../../components/utils'
import { Plus, Search } from '@rsuite/icons';
//import Image from 'next/image'

const SongPage: NextPage = () => {
    

    return (
        <Container className='page' >
            <Head title={PageName.AllSongs} description="All songs page" />
            <main>
                <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
                    <Stack wrap direction='row' justifyContent='center' spacing="1em" >
                    </Stack>
                    <Divider style={{height: '0.2em', width: '90vw'}} />
                </Stack>`
            </main>
            <Footer />
        </Container>
    )
}

export default SongPage
