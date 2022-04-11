import { useState, useRef, useEffect } from 'react'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'

import AnimateHeight from 'react-animate-height';
import useSWR from 'swr'
import { Stack, Whisper, Tooltip, Table, Timeline, Button, Popover, InputGroup, Input, Animation } from 'rsuite';
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


const fetcher = json_fetcher('GET');

const oneMonthAgoDate = new Date();
oneMonthAgoDate.setMonth(oneMonthAgoDate.getMonth() - 1);

const InfoTooltip = ({tooltip, children, color} : {tooltip: JSX.Element, children: JSX.Element, color: string}) => {

    return (
        <Whisper
            placement='left'
            preventOverflow
            trigger={["hover", "focus"]}
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

const StatCell = ({rowData, oldestSessionDate} : {rowData: any, oldestSessionDate: Date}) => {

    const [openTimeline, setOpenTimeline] = useState<boolean>(false);

    return (
        <Stack direction='column' spacing="0.5em" >
            <InfoTooltip color='#ff890a' tooltip={<p>No. of times sung since {oneMonthAgoDate.toLocaleDateString('en-GB')}</p>} >
                <h6>Past month: {rowData.dates.filter((date: string) => {
                        return oneMonthAgoDate > new Date(date);
                    }).length} sessions</h6>
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
                    <h6>All-time: {rowData.count} sessions</h6> 
                </InfoTooltip>
            </Stack>
            {/* <p>{rowData.percent}</p> */}
        </Stack>
    )
}

const StatsPage: NextPage = () => {
    //const router = useRouter();
    const [searchText, setSearchText] = useState<string>('');
    const [songsData, setSongsData] = useState<any>({});

    const { data, isValidating, error } = useSWR(`/api/stats/songs`, fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
    });

    useEffect(() => {
        if (data) {
            setSongsData(data);
        }
    }, [data])

    useEffect(() => {
        if (searchText) {
            if (data) {
                const filtered = data.orderedSongs.filter((song: any) => {
                    if (searchText) {
                        if (song.title && (song.title.toLowerCase().includes(searchText)) || (song.artist && song.artist.toLowerCase().includes(searchText))) {
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
                setSongsData({
                    ...data,
                    orderedSongs: filtered
                });
            }
        }
        else {
            setSongsData(data);
        }
    }, [searchText]);

    const oldestSessionDate = data ? new Date(data.oldestSessionDate) : new Date();

    return (
    <main>
        {/* <div style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            width: '100vw'
        }}>
            <div style={{
                //flex: 1
            }}>

                1) Top songs - sort by most used or by recent date
                2)
            </div> */}
        <Stack wrap direction='row' justifyContent='center' spacing="1em" style={{
                width: '96vw'
            }} >
            <InputGroup>
                <InputGroup.Addon>
                    <Search />
                </InputGroup.Addon>
                <Input value={searchText} onChange={(text)=>{
                        setSearchText(text);
                    }} placeholder="Search song" />
            </InputGroup>
        </Stack>
        <Table
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
            </Table.Column>
            {/* <Table.Column align="center" fixed flexGrow={1} >
                <Table.HeaderCell>Percent</Table.HeaderCell>
                <Table.Cell dataKey="percent" />
            </Table.Column> */}
        </Table>
    </main>
    )
}

export default StatsPage
