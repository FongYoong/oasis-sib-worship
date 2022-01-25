import React from 'react'
import Link from 'next/link'
//import { Nav } from 'rsuite';
import { Stack, Divider, Popover, Whisper, Button, IconButton } from 'rsuite'
import { FcNext } from 'react-icons/fc'
import { SessionProps } from './types'
import hoverStyles from '../styles/hover.module.css'

interface SessionCardProps extends SessionProps {
    dummy_member?: null
}

// eslint-disable-next-line react/display-name
const SongList = React.forwardRef(({songs, ...rest}: {songs: string[]}, ref) => {
    return (
        <Popover ref={ref as React.RefObject<HTMLDivElement>} {...rest}  >
            <ul>
            {
                songs.map((song, index) => 
                    <li key={index} >
                        <h5>
                            {song}
                        </h5>
                    </li>
                )
            }
            </ul>
        </Popover>
    )
});

const SessionCard = (props: SessionCardProps) => {
    return (
        <Link href="all_songs" passHref >
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
                            <Whisper placement="auto" trigger="click" controlId="control-id-click" speaker={<SongList songs={props.songs} />}>
                                <Button onClick={(e) => {e.preventDefault()}} appearance="primary" block >{`${props.songs.length} songs`}</Button>
                            </Whisper>
                            :
                            <h5 style={{color: 'red'}} ><i>Songs unavailable</i></h5>
                        }
                </Stack>
                <IconButton appearance='subtle' icon={<FcNext />}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0
                    }}
                />
            </Stack>
        </Link>
    )
}

export default SessionCard;