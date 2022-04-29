import React, { useState } from 'react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { IconButton, Input, InputGroup, Stack, Divider, Table, Whisper, Popover, Dropdown, Pagination, Animation } from 'rsuite';
import ModalLoader from '../../components/ModalLoader'
const SongModal = dynamic(() => import('../../components/SongModal'), {
    loading: () => <ModalLoader message="Loading song editor" />
})
const ExportSongModal = dynamic(() => import('../../components/ExportSongModal'), {
    loading: () => <ModalLoader message="Loading song exporter" />
})
const DeleteSongModal = dynamic(() => import('../../components/DeleteSongModal'), {
    loading: () => <ModalLoader message="Loading song deleter" />
})
// import SongModal from '../../components/SongModal'
// import ExportSongModal from '../../components/ExportSongModal'
// import DeleteSongModal from '../../components/DeleteSongModal'
import { SongProps } from '../../lib/types'
import { domainUrl, copyToClipboard, json_fetcher } from '../../lib/utils'
import { Plus, Search, More } from '@rsuite/icons'
import { AiOutlineLink } from 'react-icons/ai'
import { FiEdit } from 'react-icons/fi'
import { BiExport } from 'react-icons/bi'
import { RiDeleteBin2Fill } from 'react-icons/ri'
import { GrClose } from 'react-icons/gr'

// eslint-disable-next-line react/display-name
const renderRowMenu = (row_data: SongProps, handleRowMenuSelect: (eventKey?: string, row_data?: SongProps)=>void) => ({ onClose, className }: {onClose: ()=>void, className: string}, ref: React.RefObject<HTMLDivElement>) => {
    const onSelect = (eventKey?: string) => {
        handleRowMenuSelect(eventKey, row_data);
        onClose();
    }
    return (
      <Popover ref={ref} className={className} full>
        <Dropdown.Menu onSelect={onSelect} onClick={(e) => e.preventDefault()} >
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

interface AllSongsProps {
    initialSearchText: string,
    initialSortColumn: string,
    initialSortType: SortType,
    initialPageIndex: number
}
  

const AllSongsPage: NextPage<AllSongsProps> = ({initialSearchText, initialSortColumn, initialSortType, initialPageIndex}) => {
    const router = useRouter();
    const [searchText, setSearchText] = useState<string>(initialSearchText);
    const [sortColumn, setSortColumn] = useState<string>(initialSortColumn);
    const [sortType, setSortType] =useState<SortType>(initialSortType);
    const [pageIndex, setPageIndex] = useState<number>(initialPageIndex);

    const { data, isValidating, error, mutate } = useSWR(`/api/get_songs?page=${pageIndex}&searchText=${searchText}&sortType=${sortType}&sortColumn=${sortColumn}`
    , songs_fetcher, {
        revalidateOnFocus: false,
    });

    const [addSongShow, setAddSongShow] = useState<boolean>(false);
    const [editSongShow, setEditSongShow] = useState<boolean>(false);
    const [editSongId, setEditSongId] = useState<number|undefined>(undefined);
    const [exportSongShow, setExportSongShow] = useState<boolean>(false);
    const [exportSongData, setExportSongData] = useState<SongProps|undefined>(undefined);
    const [deleteSongShow, setDeleteSongShow] = useState<boolean>(false);
    const [deleteSongData, setDeleteSongData] = useState<SongProps|undefined>(undefined);

    const [addSongModalLoad, setAddSongModalLoad] = useState<boolean>(false);
    const [editSongModalLoad, setEditSongModalLoad] = useState<boolean>(false);
    const [exportSongModalLoad, setExportSongModalLoad] = useState<boolean>(false);
    const [deleteSongModalLoad, setDeleteSongModalLoad] = useState<boolean>(false);

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
                setEditSongModalLoad(true)
                setEditSongShow(true)
                setEditSongId(song_data?.id)
            }
            else if (eventKey == 'share') {
                const url = `https://${domainUrl}/view_song/${song_data.id}`;
                copyToClipboard(url, 'Copied URL to clipboard');
            }
            else if (eventKey == 'export') {
                setExportSongModalLoad(true)
                setExportSongShow(true)
                setExportSongData(song_data)
            }
            else if (eventKey == 'delete') {
                setDeleteSongModalLoad(true)
                setDeleteSongShow(true)
                setDeleteSongData(song_data)
            }
        }
    };

    const handleSortColumn = (sortColumn: string, sortType: SortType) => {
        setSortColumn(sortColumn);
        setSortType(sortType);
        setPageIndex(1);
        router.replace({
            pathname: router.pathname,
            query: {
              ...router.query,
              sortColumn,
              sortType,
              pageIndex: 1
            },
        });
    };

    const maxItemsPerPage: number = data ? data.maxItemsPerPage : 0;
    const totalPages: number = data ? data.totalPages : 0;
    const processed_data = data && data.songs ? data.songs.map((song: SongProps) => {
        const date = new Date(song.updatedAt);
        //const dateString = date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        const dateString = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        const timeString = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        return {
            ...song,
            updatedAt: `${dateString}, ${timeString}`
        }
    }) : [];
    //console.log(error);

    //console.log(editSongId);

    return (
        <>
            {addSongModalLoad && <SongModal visibility={addSongShow} handleClose={handleAddSongClose} onSuccess={mutate} /> }
            {editSongModalLoad && <SongModal editSong={true} editSongId={editSongId} visibility={editSongShow} handleClose={handleEditSongClose} onSuccess={mutate} /> }
            {exportSongModalLoad && <ExportSongModal songData={exportSongData} visibility={exportSongShow} handleClose={handleExportSongClose} /> }
            {deleteSongModalLoad && <DeleteSongModal songData={deleteSongData} visibility={deleteSongShow} handleClose={handleDeleteSongClose} onSuccess={mutate} /> }
            <main>
                <Stack wrap direction='row' justifyContent='center' spacing="1em" style={{
                    width: '96vw'
                }} >
                    <IconButton appearance="primary" color="green" icon={<Plus />}
                        onClick={() => {
                            setAddSongModalLoad(true)
                            setAddSongShow(true)
                        }} >
                        Add Song
                    </IconButton>
                    <InputGroup>
                        <InputGroup.Addon>
                            <Search />
                        </InputGroup.Addon>
                        <Input value={searchText} onChange={(text)=>{
                            setSearchText(text);
                            setPageIndex(1);
                            router.replace({
                                pathname: router.pathname,
                                query: {
                                  ...router.query,
                                  searchText: text,
                                  pageIndex: 1
                                },
                            });
                            }} placeholder="Search song"
                        />
                        <InputGroup.Button appearance='ghost' onClick={() => {
                            setSearchText('');
                            setPageIndex(1);
                            router.replace({
                                pathname: router.pathname,
                                query: {
                                  ...router.query,
                                  searchText: '',
                                  pageIndex: 1
                                },
                            });
                        }}>
                            <GrClose />
                        </InputGroup.Button>
                    </InputGroup>
                </Stack>
                
                <Table
                    wordWrap
                    bordered
                    style={{marginTop: '2em'}}
                    autoHeight
                    //height={500}
                    data={processed_data}
                    loading={!data || isValidating}
                    sortColumn={sortColumn}
                    sortType={sortType}
                    onSortColumn={handleSortColumn}
                    // onRowClick={(row_data: unknown, event: React.MouseEvent<Element, MouseEvent>) => {
                    //     if ((event.target as Element).nodeName == 'DIV') {
                    //         router.push(`/view_song/${(row_data as SongProps).id}`);
                    //     }
                    // }}
                    renderRow={(children, row_data) => {
                        return (
                                row_data ?
                                <Link passHref href={`/view_song/${(row_data as SongProps).id}`} >
                                    <a>
                                        {children}
                                    </a>
                                </Link>
                                :
                                children
                        )
                    }}
                >
                    <Table.Column align="center" fixed sortable flexGrow={1} >
                        <Table.HeaderCell>Updated</Table.HeaderCell>
                        <Table.Cell dataKey="updatedAt" />
                    </Table.Column>
                    <Table.Column align="center" fixed sortable flexGrow={2} >
                        <Table.HeaderCell>Title</Table.HeaderCell>
                        <Table.Cell dataKey="title" />
                    </Table.Column>
                    <Table.Column align="center" fixed sortable flexGrow={1} >
                        <Table.HeaderCell>Artist</Table.HeaderCell>
                        <Table.Cell dataKey="artist" />
                    </Table.Column>
                    <Table.Column flexGrow={1} >
                        <Table.HeaderCell>Action</Table.HeaderCell>
                        <Table.Cell>
                            {(rowData: SongProps) => {
                                return (
                                    <>
                                    <Whisper placement="auto" trigger="click" speaker={renderRowMenu(rowData, handleRowMenuSelect)}>
                                        <IconButton onClick={(e) => e.preventDefault()} appearance="ghost" icon={<More />} />
                                    </Whisper>
                                    </>
                                );
                            }}
                        </Table.Cell>
                    </Table.Column>
                </Table>
                { data &&
                    <Animation.Bounce in >
                        <Pagination style={{padding: '0.5em', border: '5px double rgba(47,116,169,0.5)', borderRadius: '0.5em'}}                            
                            prev next size="lg"
                            total={totalPages * maxItemsPerPage} limit={maxItemsPerPage} activePage={pageIndex}
                            onChangePage={(newIndex: number) => {
                                setPageIndex(newIndex);
                                router.replace({
                                    pathname: router.pathname,
                                    query: {
                                        ...router.query,
                                        pageIndex: newIndex
                                    },
                                });
                            }} />
                    </Animation.Bounce>
                }
                <Divider style={{height: '0.2em', width: '90vw'}} />
            </main>
        </>
    )
}

export default AllSongsPage

AllSongsPage.getInitialProps = async (ctx) => {
    const searchText = ctx.query.searchText as string;
    const sortColumn = ctx.query.sortColumn as string;
    const sortType = ctx.query.sortType as SortType;
    const pageIndex = parseInt(ctx.query.pageIndex as string);
  
    return {
      initialSearchText: searchText ? searchText : '',
      initialSortColumn: sortColumn ? sortColumn : 'updatedAt',
      initialSortType: sortType ? sortType : 'desc',
      initialPageIndex: isNaN(pageIndex) ? 1 : pageIndex,
    }
}