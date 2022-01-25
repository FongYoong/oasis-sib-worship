import { useState } from 'react'
import type { NextPage } from 'next'
import { Container, IconButton, Input, InputGroup, Stack, Divider, Table, Column, Cell, HeaderCell } from 'rsuite';
import Head from '../../components/Head'
import Footer from '../../components/Footer'
import AddSongModal from '../../components/AddSongModal'
import { SessionProps, PageName } from '../../components/types'
import { isPresentOrFutureDate } from '../../components/utils'
import { Plus, Search } from '@rsuite/icons';
//import Image from 'next/image'

const AllSongsPage: NextPage = () => {
    
    const [addSongShow, setAddSongShow] = useState<boolean>(false);

    const handleAddSongClose = () => {
        setAddSongShow(false);
    }

    const sortColumn = () => {

    };
    const getData = () => {

    };

    const sortType = () => {

    };
    const handleSortColumn = () => {

    };
    const loading = false;

    return (
        <Container className='page' >
            <AddSongModal visibility={addSongShow} handleClose={handleAddSongClose} />
            <Head title={PageName.AllSongs} description="All songs page" />
            <main>
                <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
                    <Stack wrap direction='row' justifyContent='center' spacing="1em" >
                        <IconButton appearance="primary" color="green" icon={<Plus />} onClick={() => setAddSongShow(true)} >
                            Add Song
                        </IconButton>
                        <InputGroup>
                            <InputGroup.Addon>
                                <Search />
                            </InputGroup.Addon>
                            <Input placeholder="Search song" />
                        </InputGroup>
                    </Stack>
                   
                    {/* <Table
                        height={420}
                        data={[]}
                        sortColumn={sortColumn}
                        sortType={sortType}
                        onSortColumn={handleSortColumn}
                        loading={loading}
                        onRowClick={data => {
                            console.log(data);
                        }}
                        >
                        <Column width={70} align="center" fixed sortable>
                            <HeaderCell>Id</HeaderCell>
                            <Cell dataKey="id" />
                        </Column>

                        <Column width={130} fixed sortable>
                            <HeaderCell>First Name</HeaderCell>
                            <Cell dataKey="firstName" />
                        </Column>

                        <Column width={130} sortable>
                            <HeaderCell>Last Name</HeaderCell>
                            <Cell dataKey="lastName" />
                        </Column>

                        <Column width={200} sortable>
                            <HeaderCell>City</HeaderCell>
                            <Cell dataKey="city" />
                        </Column>

                        <Column width={200}>
                            <HeaderCell>Company Name</HeaderCell>
                            <Cell dataKey="companyName" />
                        </Column>
                    </Table> */}
                    <Divider style={{height: '0.2em', width: '90vw'}} />
                </Stack>`
            </main>
            <Footer />
        </Container>
    )
}

export default AllSongsPage
