import { useState, useRef, useEffect } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import AnimateHeight from 'react-animate-height';
import InfiniteScroll from 'react-infinite-scroll-component';
import useSWR from 'swr'
import { Stack, Whisper, Tooltip, Divider, Timeline, Button, Popover, InputGroup, Input, Dropdown, Loader, Animation } from 'rsuite';
// import SongModal from '../../components/SongModal'
// import ExportSongModal from '../../components/ExportSongModal'
// import DeleteSongModal from '../../components/DeleteSongModal'
//import NotFound from '../../components/NotFound'
import { json_fetcher } from '../../lib/utils'
import { Search } from '@rsuite/icons'
import { AiFillInfoCircle } from 'react-icons/ai'
import { BsCalendarDate } from 'react-icons/bs'
import { GoPrimitiveDot } from 'react-icons/go'
import { FaDotCircle } from 'react-icons/fa'
import { GrClose } from 'react-icons/gr'
import hoverStyles from '../../styles/hover.module.css'


const fetcher = json_fetcher('GET');

const InfoTooltip = ({tooltip, children, color} : {tooltip: JSX.Element, children: JSX.Element, color: string}) => {

    return (
        <Whisper
            placement='left'
            preventOverflow
            trigger={["hover", "click"]}
            speaker={ 
                <Tooltip style={{ width: 150 }}>
                    {tooltip}
                </Tooltip>
            }
        >
            <Stack direction='row' style={{
                border: `2px solid ${color}`,
                borderRadius: '1em',
                padding: '0.5em'
            }} >
                <AiFillInfoCircle style={{ marginRight: '0.5em' }} />
                {children}
            </Stack>
        </Whisper>
    )
}

const oneMonthAgoDate = new Date();
oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);

const SongRow = ({index, rowData, oldestSessionDate} : {index: number, rowData: any, oldestSessionDate: Date}) => {

    const [openTimeline, setOpenTimeline] = useState<boolean>(false);

    return (
        <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
        }} >
            <Link passHref href={`/view_song/${(rowData).id}`} >
                <a style={{
                    flex: 1
                }}  >
                    {index + 1}
                    <Stack className={hoverStyles.hover_grow} direction='column' justifyContent='center' alignItems='flex-end' >
                        <h6>{rowData.title}</h6>
                        <p>{rowData.artist ? rowData.artist: 'No Artist'}</p>
                    </Stack>
                </a>
            </Link>
            <Divider vertical style={{ height: '10vh' }} />
            <Stack direction='column' spacing="0.5em" justifyContent='center' alignItems='flex-start'
                style={{
                    flex: 1
                }}
            >
                <InfoTooltip color='#ff890a' tooltip={<p>No. of times sung since {oneMonthAgoDate.toLocaleDateString('en-GB')}</p>} >
                    <h6>Past month: {rowData.sessionsPastMonth} sessions</h6>
                </InfoTooltip>
                <Stack spacing='0.5em' >
                    <Whisper
                        trigger="click"
                        placement='auto'
                        preventOverflow
                        speaker={
                            <Popover>
                                <Timeline>
                                    {
                                        (rowData.dates as string[]).map((date, index) =>
                                            <Timeline.Item key={index} dot={index > 0 ? <GoPrimitiveDot /> : <FaDotCircle />} >
                                                {new Date(date).toLocaleDateString('en-GB')}
                                            </Timeline.Item>
                                        )
                                    }
                                </Timeline>
                            </Popover>
                        }
                    >
                        <Button appearance='ghost' onClick={() => setOpenTimeline(!openTimeline)} >
                            <BsCalendarDate />
                        </Button>
                    </Whisper>
                    <InfoTooltip color='#1c9dff' tooltip={<p>No. of times sung since {oldestSessionDate.toLocaleDateString('en-GB')}</p>} >
                        <h6>All-time: {rowData.sessionsAllTime} sessions</h6> 
                    </InfoTooltip>
                </Stack>
            </Stack>
        </div>
    )
}

const MAX_SONGS = 10;

type ListType = 'Past Month'|'All-Time'

const sortSongs = (songs: any, type: ListType) => {
    if (type == 'Past Month') {
        return songs.sort((a: any, b: any) => 
            b.sessionsPastMonth - a.sessionsPastMonth
        )
    }
    else if (type == 'All-Time') {
        return songs.sort((a: any, b: any) => 
            b.sessionsAllTime - a.sessionsAllTime
        )
    }
}

const StatsPage: NextPage = () => {
    //const router = useRouter();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [listType, setListType] = useState<ListType>('Past Month');
    const [searchText, setSearchText] = useState<string>('');
    const [songsData, setSongsData] = useState<any>([]);
    const [songsScrollData, setSongsScrollData] = useState<any>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const { data, isValidating, error } = useSWR(`/api/stats/songs`, fetcher, {
        revalidateIfStale: true,
        revalidateOnFocus: false,
        revalidateOnReconnect: true
    });

    useEffect(() => {
        if (data) {
            setSongsData(sortSongs(data.orderedSongs, listType));
        }
    }, [data])

    useEffect(() => {
        if (data) {
            if (searchText) {
                const filtered = data.orderedSongs.filter((song: any) => {
                    if (searchText) {
                        const search = searchText.toLowerCase();
                        if (song.title && (song.title.toLowerCase().includes(search)) || (song.artist && song.artist.toLowerCase().includes(search))) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return true;
                    }
                })
                setSongsData(sortSongs(filtered, listType));
            }
            else {
                setSongsData(sortSongs(data.orderedSongs, listType));
            }
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTo(0, 0);
            }
        }
    }, [searchText]);

    useEffect(() => {
        if(songsData.length > 0) {
            setSongsData(sortSongs(songsData, listType));
        }
    }, [listType])

    useEffect(() => {
        if (songsData) {
            setLoading(false);
            setSongsScrollData(songsData.slice(0, MAX_SONGS));
        }
    }, [songsData])

    const fetchMoreSongs = () => {
        setSongsScrollData(songsScrollData.concat(songsData.slice(songsScrollData.length, songsScrollData.length + MAX_SONGS)));
    }

    const oldestSessionDate = data ? new Date(data.oldestSessionDate) : new Date();

    return (
    <main>
        <Stack direction='column' justifyContent='center' alignItems='center' spacing="1em" >
            <h2 style={{textAlign: 'center'}} >Song Rankings</h2>
            <Stack wrap direction='row' justifyContent='center' alignItems='center' spacing="1em" >
                <InputGroup>
                    <InputGroup.Addon>
                        <Search />
                    </InputGroup.Addon>
                    <Input value={searchText} onChange={(text)=>{
                            setSearchText(text);
                        }} placeholder="Search song"
                    />
                    <InputGroup.Button appearance='ghost' onClick={() => {
                        setSearchText('');
                    }}>
                        <GrClose />
                    </InputGroup.Button>
                </InputGroup>
                <Stack direction='column' justifyContent='center' alignItems='center' spacing="0.5em" >
                    <h6>Sort by:</h6>
                    <Dropdown title={listType}
                        onSelect={(eventKey: string, event: unknown) => {
                            setListType(eventKey as ListType)
                        }}
                    >
                        {
                            ["Past Month", "All-Time"].map((type: string, index: number) => 
                                <Dropdown.Item key={index} eventKey={type}>
                                    {type}
                                </Dropdown.Item>
                            )
                        }
                    </Dropdown>
                </Stack>
            </Stack>
            {data && <h5 style={{textAlign: 'center'}} >{songsData.length} songs</h5>}
            <div id="songsScrollableDiv" ref={scrollContainerRef} style={{
                height: '60vh',
                width: '95vw',
                overflowY: 'auto',
                padding: '1em',
                border: '2px solid #00648f',
                borderRadius: '0.5em'
            }} >
                <InfiniteScroll
                    dataLength={songsScrollData.length}
                    next={fetchMoreSongs}
                    hasMore={songsScrollData.length < songsData.length}
                    loader={<Loader size='md' />}
                    endMessage={
                        isValidating ? null :
                            <p style={{ textAlign: 'center' }}>
                            <   b>You&apos;ve reached the end of this list. ????</b>
                            </p>
                    }
                    scrollableTarget="songsScrollableDiv"
                    >
                    {
                        loading ?
                        <Loader size='md' />
                        :
                        songsScrollData.map((song: any, index: number) => 
                            <>
                                <SongRow key={song.id} rowData={song} index={index} oldestSessionDate={oldestSessionDate} />
                                <Divider />
                            </>
                        )
                    }
                </InfiniteScroll>
            </div>
            <Divider style={{width: '90vw'}} />
            <h2 style={{textAlign: 'center'}} >Visualizations</h2>
            <p style={{textAlign: 'center'}} >This section is left empty for now. ???? </p>
        </Stack>
    </main>
    )
}

export default StatsPage

{/* <Table
    cellBordered
    //virtualized
    wordWrap
    bordered
    loading={!songsData || isValidating}
    height={400}
    data={songsData ? songsData.orderedSongs : []}
    style={{
        width: '100vw',
        marginTop: '2em',
    }}
>
    <Table.Column align="center" fixed flexGrow={1} >
        <Table.HeaderCell><h5>Song</h5></Table.HeaderCell>
        <Table.Cell>
            {(rowData: any) => {
                return (
                    <Link passHref href={`/view_song/${(rowData).id}`} >
                        <a>
                            <Stack direction='column' >
                                <h6>{rowData.title}</h6>
                                <p>{rowData.artist ? rowData.artist: 'No Artist'}</p>
                            </Stack>
                        </a>
                    </Link>
                );
            }}
        </Table.Cell>
    </Table.Column>
    <Table.Column align="center" fixed flexGrow={2} >
        <Table.HeaderCell><h5>Info</h5></Table.HeaderCell>
        <Table.Cell>
            {(rowData: any) => {
                return (
                    <StatCell rowData={rowData} oldestSessionDate={oldestSessionDate} />
                );
            }}
        </Table.Cell>
    </Table.Column> */}
    {/* <Table.Column align="center" fixed flexGrow={1} >
        <Table.HeaderCell>Percent</Table.HeaderCell>
        <Table.Cell dataKey="percent" />
    </Table.Column> */}
{/* </Table> */}