import React from 'react'
import { Stack, Divider, Popover, Whisper, Button, IconButton, List } from 'rsuite'
//import { PickerInstance } from 'rsuite/Picker'
import useSWR from 'swr'
import { SessionProps } from './types'
import { json_fetcher } from '../lib/utils'
//import { FcNext } from 'react-icons/fc'
import { RiDeleteBin2Fill } from 'react-icons/ri'
import hoverStyles from '../styles/hover.module.css'

interface SessionCardProps extends SessionProps {
    onClick?: (event: React.MouseEvent<Element, MouseEvent>) => void,
    deleteOnClick?: (event: React.MouseEvent<Element, MouseEvent>) => void
}

const song_fetcher = json_fetcher('GET');

const SongItem = ({song_id, index} : {song_id: number, index: number}) => {
    const { data, isValidating, error } = useSWR(`/api/get_song/${song_id}`, song_fetcher);
    return (
        <h6 style={{wordWrap: 'break-word'}} >
            {index + 1}. {data ? `${data.title} - ${data.artist}` : 'Loading...'}
        </h6>
    );
}

// eslint-disable-next-line react/display-name
const SongList = React.forwardRef(({song_ids, ...rest}: {song_ids: number[]}, ref) => {
    return (
        <Popover ref={ref as React.RefObject<HTMLDivElement>} {...rest}  >
            <List bordered hover>
            {
                song_ids.map((id: number, index: number) => 
                    <List.Item key={index} index={index} >
                        <SongItem song_id={id} index={index} />
                    </List.Item>
                )
            }
            </List>
        </Popover>
    )
});

const SessionCard = (props: SessionCardProps) => {
    return (
        <div onClick={props.onClick} >
            <Stack justifyContent='space-between' direction='row'
                className={hoverStyles.hover_grow}
                style={{
                    boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
                    borderRadius: "0.5em",
                    padding: "1em"
                }}
            >
                <Stack direction='column'>
                    <h2>{props.date.getDate()}</h2>
                    <h2>{props.date.toDateString().split(' ')[1]}</h2>
                    <h2>{props.date.getFullYear()}</h2>
                </Stack>
                <Divider vertical style={{height: '10em'}} />
                <Stack spacing='1em' direction='column' justifyContent='space-between' >
                    <h4> {props.worship_leader} </h4>
                        {
                            props.songs.length > 0 ?
                            <Whisper preventOverflow placement="auto" trigger="click" controlId="control-id-click" speaker={<SongList song_ids={props.songs} />}>
                                <Button onClick={(e) => {e.preventDefault()}} appearance="primary" block >{`${props.songs.length} songs`}</Button>
                            </Whisper>
                            :
                            <h5 style={{color: 'red'}} ><i>No songs</i></h5>
                        }
                </Stack>
                <IconButton appearance='subtle' icon={<RiDeleteBin2Fill />} onClick={props.deleteOnClick}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0
                    }}
                />
            </Stack>
        </div>
    )
}

export default SessionCard;