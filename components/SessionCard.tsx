import React from 'react'
import Link from 'next/link'
import { Stack, Divider, Whisper, Popover, Dropdown, Button, IconButton, List, Loader } from 'rsuite'
import useSWR from 'swr'
import { SessionProps, SongProps } from '../lib/types'
import { json_fetcher } from '../lib/utils'
import { More } from '@rsuite/icons'
import { AiOutlineLink } from 'react-icons/ai'
import { FiEdit } from 'react-icons/fi'
import { BiExport } from 'react-icons/bi'
import { RiDeleteBin2Fill } from 'react-icons/ri'
import hoverStyles from '../styles/hover.module.css'

interface SessionCardProps extends SessionProps {
    //onClick?: (event: React.MouseEvent<Element, MouseEvent>) => void,
    handleSessionMenuSelect: (eventKey?: string, session_data?: SessionProps)=>void
}

const songs_fetcher = json_fetcher('GET');

const SongItem = ({songData, index} : {songData: SongProps, index: number}) => {
    //const { data, isValidating, error } = useSWR(`/api/get_song/${song_id}`, song_fetcher);

    return (
        <div>
            <Stack spacing='1em' >
                <h6 style={{wordWrap: 'break-word'}} >
                    {index + 1}.&nbsp;  {songData ? `${songData.title} - ${songData.artist ? songData.artist : 'No Artist'}` : ''}
                </h6>
                {!songData && <Loader />}
            </Stack>
        </div>
    );
}

// eslint-disable-next-line react/display-name
const SongList = React.forwardRef(({song_ids, ...rest}: {song_ids: number[]}, ref) => {
    const { data: songsData, isValidating, error } = useSWR(song_ids ? `/api/get_song/${song_ids.join(',')}}?multiple` : null, songs_fetcher);
    return (
        <Popover  ref={ref as React.RefObject<HTMLDivElement>} {...rest}
            onClick={(event: React.MouseEvent<Element, MouseEvent>) => {
                event.stopPropagation();
            }}
        >
            <List bordered hover>
                { songsData && songsData.map((songData: SongProps, index: number) => 
                        <Link key={index} passHref href={`/view_song/${songData.id}`}>
                            <a>
                                <List.Item index={index}>
                                    <SongItem songData={songData} index={index} />
                                </List.Item>
                            </a>
                        </Link>
                    )
                }
                {!songsData && <Loader style={{margin:'2em'}} /> }
            </List>
        </Popover>
    )
});

// eslint-disable-next-line react/display-name
const renderSessionMenu = (props: SessionCardProps) => ({ onClose, className }: {onClose: ()=>void, className: string}, ref: React.RefObject<HTMLDivElement>) => {
    const onSelect = (eventKey?: string) => {
        props.handleSessionMenuSelect(eventKey, props);
        onClose();
    }
    return (
      <Popover ref={ref} className={className} full >
        <Dropdown.Menu onSelect={onSelect} onClick={(e) => {e.preventDefault()}} >
          <Dropdown.Item icon={<FiEdit style={{marginRight: '0.4em'}} />} eventKey='edit'>Edit</Dropdown.Item>
          <Dropdown.Item icon={<AiOutlineLink style={{marginRight: '0.4em'}} />} eventKey='share'>Share</Dropdown.Item>
          <Dropdown.Item icon={<BiExport style={{marginRight: '0.4em'}} />} eventKey='export'>Export</Dropdown.Item>
          <Dropdown.Item icon={<RiDeleteBin2Fill style={{marginRight: '0.4em'}} />} eventKey='delete'>Delete</Dropdown.Item>
        </Dropdown.Menu>
      </Popover>
    );
};

const SessionCard = ({sessionProps, ...rest}: {sessionProps: SessionCardProps}) => {
    return (
        <Link passHref href={`/view_session/${sessionProps.id}`} >
            <a>
            <Stack justifyContent='space-between' direction='row'
                className={hoverStyles.hover_grow}
                style={{
                    cursor: 'pointer',
                    backgroundColor: 'white',
                    boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                    borderRadius: "0.5em",
                    padding: "1em"
                }}
                {...rest}
            >
                <Stack direction='column'>
                    <h2>{sessionProps.date.getDate()}</h2>
                    <h2>{sessionProps.date.toDateString().split(' ')[1]}</h2>
                    <h2>{sessionProps.date.getFullYear()}</h2>
                </Stack>
                <Divider vertical style={{height: '10em'}} />
                <Stack spacing='1em' direction='column' justifyContent='space-between' >
                    <h4> {sessionProps.worship_leader} </h4>
                        {
                            sessionProps.songs.length > 0 ?
                            <Whisper preventOverflow placement="auto" trigger="click" controlId="control-id-click" speaker={<SongList song_ids={sessionProps.songs} />}>
                                <Button onClick={(e) => {e.preventDefault()}} appearance="primary" block >{`${sessionProps.songs.length} songs`}</Button>
                            </Whisper>
                            :
                            <h5 style={{color: 'red'}} ><i>No songs</i></h5>
                        }
                </Stack>
                <Whisper placement="auto" trigger="click" speaker={renderSessionMenu(sessionProps)}>
                    <IconButton appearance="ghost" icon={<More />}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0
                        }}
                        onClick={(e) => {e.preventDefault()}}
                    />
                </Whisper>
            </Stack>
            </a>
        </Link>
    )
}

export default SessionCard;