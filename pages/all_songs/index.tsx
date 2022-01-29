import React from 'react'
import { useState } from 'react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { Container, IconButton, Input, InputGroup, Stack, Divider, Table, Whisper, Popover, Dropdown, Tag } from 'rsuite';
import Head from '../../components/Head'
import Footer from '../../components/Footer'
import SongModal from '../../components/SongModal'
import ExportSongModal from '../../components/ExportSongModal'
import DeleteSongModal from '../../components/DeleteSongModal'
import { SongProps, PageName } from '../../components/types'
import { domainUrl, copyToClipboard, json_fetcher } from '../../lib/utils'
import { Plus, Search, More } from '@rsuite/icons'
import { AiOutlineLink } from 'react-icons/ai'
import { FiEdit } from 'react-icons/fi'
import { BiExport } from 'react-icons/bi'
import { RiDeleteBin2Fill } from 'react-icons/ri'

// eslint-disable-next-line react/display-name
const renderRowMenu = (row_data: SongProps, handleRowMenuSelect: (eventKey?: string, row_data?: SongProps)=>void) => ({ onClose, className }: {onClose: ()=>void, className: string}, ref: React.RefObject<HTMLDivElement>) => {
    const onSelect = (eventKey?: string) => {
        handleRowMenuSelect(eventKey, row_data);
        onClose();
    }
    return (
      <Popover ref={ref} className={className} full>
        <Dropdown.Menu onSelect={onSelect} >
          <Dropdown.Item icon={<FiEdit style={{marginRight: '0.4em'}} />} eventKey='edit'>Edit</Dropdown.Item>
          <Dropdown.Item icon={<AiOutlineLink style={{marginRight: '0.4em'}} />} eventKey='share'>Share</Dropdown.Item>
          <Dropdown.Item icon={<BiExport style={{marginRight: '0.4em'}} />} eventKey='export'>Export</Dropdown.Item>
          <Dropdown.Item icon={<RiDeleteBin2Fill style={{marginRight: '0.4em'}} />} eventKey='delete'>Delete</Dropdown.Item>
        </Dropdown.Menu>
      </Popover>
    );
};

type SortType = 'asc' | 'desc' | undefined;

const songs_fetcher = json_fetcher('GET');

const AllSongsPage: NextPage = () => {
    const router = useRouter();
    const [searchText, setSearchText] = useState<string>('');
    const [sortColumn, setSortColumn] = useState<string>('updatedAt');
    const [sortType, setSortType] =useState<SortType>('desc');

    const [lastSongId, setLastSongId] = useState<number>(0);
    const { data, isValidating, error, mutate } = useSWR(`/api/get_songs?lastSongId=${lastSongId}&searchText=${searchText}&sortType=${sortType}&sortColumn=${sortColumn}`
    , songs_fetcher);

    const [addSongShow, setAddSongShow] = useState<boolean>(false);
    const [editSongShow, setEditSongShow] = useState<boolean>(false);
    const [editSongId, setEditSongId] = useState<number|undefined>(undefined);
    const [exportSongShow, setExportSongShow] = useState<boolean>(false);
    const [exportSongData, setExportSongData] = useState<SongProps|undefined>(undefined);
    const [deleteSongShow, setDeleteSongShow] = useState<boolean>(false);
    const [deleteSongData, setDeleteSongData] = useState<SongProps|undefined>(undefined);

    const handleAddSongClose = () => {
        setAddSongShow(false);
    }
    const handleEditSongClose = () => {
        setEditSongShow(false);
    }
    const handleExportSongClose = () => {
        setExportSongShow(false);
    }
    const handleDeleteSongClose = () => {
        setDeleteSongShow(false);
    }

    const handleRowMenuSelect = (eventKey?: string, song_data?: SongProps) => {
        if (song_data) {
            if (eventKey == 'edit') {
                setEditSongShow(true)
                setEditSongId(song_data?.id)
            }
            else if (eventKey == 'share') {
                const url = `${domainUrl}/view_song/${song_data.id}`;
                copyToClipboard(url, 'Copied URL to clipboard');
            }
            else if (eventKey == 'export') {
                setExportSongShow(true)
                setExportSongData(song_data)
            }
            else if (eventKey == 'delete') {
                setDeleteSongShow(true)
                setDeleteSongData(song_data)
            }
        }
    };

    const handleSortColumn = (sortColumn: string, sortType: SortType) => {
        setSortColumn(sortColumn);
        setSortType(sortType);
    };

    const processed_data = data ? data.map((song: SongProps) => {
        return {
            ...song,
            updatedAt: new Date(song.updatedAt).toLocaleString()
        }
    }) : [];
    console.log(error);

    return (
        <Container className='page' >
            <SongModal visibility={addSongShow} handleClose={handleAddSongClose} onSuccess={mutate} />
            <SongModal editSong={editSongShow} editSongId={editSongId} visibility={editSongShow} handleClose={handleEditSongClose} onSuccess={mutate} />
            <ExportSongModal songData={exportSongData} visibility={exportSongShow} handleClose={handleExportSongClose} />
            <DeleteSongModal songData={deleteSongData} visibility={deleteSongShow} handleClose={handleDeleteSongClose} onSuccess={mutate} />
            <Head title={PageName.AllSongs} description="All songs page" />
            <main>
                <Stack wrap direction='row' justifyContent='center' spacing="1em" >
                    <IconButton appearance="primary" color="green" icon={<Plus />} onClick={() => setAddSongShow(true)} >
                        Add Song
                    </IconButton>
                    <InputGroup>
                        <InputGroup.Addon>
                            <Search />
                        </InputGroup.Addon>
                        <Input onChange={(text)=>{setSearchText(text)}} placeholder="Search song" />
                    </InputGroup>
                </Stack>
                
                <Table
                    wordWrap
                    bordered
                    style={{marginTop: '2em'}}
                    height={400}
                    data={processed_data}
                    loading={!data || isValidating}
                    sortColumn={sortColumn}
                    sortType={sortType}
                    onSortColumn={handleSortColumn}
                    onRowClick={(row_data: unknown, event: React.MouseEvent<Element, MouseEvent>) => {
                        if ((event.target as Element).nodeName == 'DIV') {
                            //handleRowMenuSelect('edit', row_data as SongProps)
                            router.push(`/view_song/${(row_data as SongProps).id}`);
                        }
                    }}
                    >
                    <Table.Column width={120} align="center" fixed sortable flexGrow={1} >
                        <Table.HeaderCell>Updated</Table.HeaderCell>
                        <Table.Cell dataKey="updatedAt" />
                    </Table.Column>
                    <Table.Column width={100} align="center" fixed sortable flexGrow={1} >
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        <Table.Cell dataKey="title" />
                    </Table.Column>
                    <Table.Column width={100} align="center" fixed sortable flexGrow={1} >
                        <Table.HeaderCell>Artist</Table.HeaderCell>
                        <Table.Cell dataKey="artist" />
                    </Table.Column>
                    <Table.Column width={200} flexGrow={1} >
                        <Table.HeaderCell>Action</Table.HeaderCell>
                        <Table.Cell>
                            {(rowData: SongProps) => {
                                return (
                                    <>
                                    <Whisper placement="auto" trigger="click" speaker={renderRowMenu(rowData, handleRowMenuSelect)}>
                                        <IconButton appearance="ghost" icon={<More />} />
                                    </Whisper>
                                    </>
                                );
                            }}
                        </Table.Cell>
                    </Table.Column>
                </Table>
                <Divider style={{height: '0.2em', width: '90vw'}} />
            </main>
            <Footer />
        </Container>
    )
}

export default AllSongsPage
