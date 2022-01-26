import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import useSWR from 'swr'
import { Container, Steps, DatePicker, Modal, Form, Stack, Button, IconButton, Animation, InputGroup, AutoComplete, List, Progress } from 'rsuite'
import SongModal from './SongModal'
import { json_fetcher } from '../lib/utils'
import { AiFillSound } from 'react-icons/ai'
import { GiGuitar } from 'react-icons/gi'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdPiano } from 'react-icons/md'
import { FaDrumSteelpan, FaMusic } from 'react-icons/fa'
import { IoPersonAdd } from 'react-icons/io5'
import { Plus } from '@rsuite/icons'
import { SongProps } from './types'
//import hoverStyles from '../styles/hover.module.css'

interface SessionModalProps {
    visibility: boolean,
    handleClose: () => void,
    editSession?: boolean,
    editSessionId?: number
}

const SongAutocomplete = ({ onSelect }:{ onSelect: (song_id: number)=>void }) => {
    const [searchText, setSearchText] = useState<string>('');
    const song_fetcher = json_fetcher({
        take: 5,
        where: {
            OR: [
                {
                  title: {
                    contains: searchText,
                  },
                },
                {
                  artist: {
                    contains: searchText,
                  },
                }
            ],
        }
    });
    const { data, error } = useSWR(`/api/get_songs`, song_fetcher, { refreshInterval: 1000 });
    const songs = data ? data.map((song: SongProps) => `${song.title} - ${song.artist}___:${song.id}`) : [];

    return (
        <AutoComplete value={searchText} data={songs} placeholder='Search song by title or artist'
            onChange={(value: unknown) => {
                const splitted = (value as string).split('___:');
                setSearchText(splitted[0])
            }}
            // filterBy={(value: string, item: unknown) => {
            //     return (item as string).includes(value)
            // }}
            onSelect={(value: unknown) => {
                const splitted = (value as string).split('___:');
                const song_id = parseInt(splitted[1]);
                onSelect(song_id)
            }}
            renderMenuItem={(value: unknown) => {
                const splitted = (value as string).split('___:');
                return (
                    <div>
                        {splitted[0]}
                    </div>
                );
            }}
        />
    )
}

const song_list_fetcher = json_fetcher();

const SongListItem = ({ song_id, index } : { song_id: number, index: number }) => {
    const { data, error } = useSWR(`/api/get_song/${song_id}`, song_list_fetcher);

    return (
        <List.Item index={index} >
          {data ? `${data.title}  ${data.artist}` : 'Loading...'}
        </List.Item>
    )
}

const session_fetcher = json_fetcher();

const SessionModal = (props: SessionModalProps) => {
    const [formIndex, setFormIndex] = useState<number>(0);
    const [dateValue, setDateValue] = useState<Date|null>(null);
    const [dutyFormData, setDutyFormData] = useState<Record<string, string>|undefined>(undefined);
    const [addSongShow, setAddSongShow] = useState<boolean>(false);
    const handleAddSongClose = () => {
        setAddSongShow(false);
    }
    
    const [songList, setSongList] = useState<number[]>([]);
    interface MovedItemInfo {oldIndex: number, newIndex: number}
    const handleSongSort = (props: MovedItemInfo | undefined) => {
        const moveData = songList.splice(props?.oldIndex as number, 1);
        const newData = [...songList];
        newData.splice(props?.newIndex as number, 0, moveData[0]);
        setSongList(newData);
    };

    const { data, error } = useSWR(props.editSession ? `/api/get_session/${props.editSessionId}` : null, session_fetcher);

    useEffect(() => {
        if(data) {
            setDutyFormData(data);
        }
    }, [data]);

    const pauseModal = props.editSession && !data;

    const addSession = () => {
        const body = JSON.stringify({

        });
        fetch('/api/add_session', {
            method: 'POST',
            body: body,
        }).then((res) => {
            res.json().then((res_data) => {
                console.log("Added session");
                console.log(res_data);
            });
            props.handleClose();
        }).catch((error) => {
            console.log(error);
        });
    };

    const updateSession = () => {
        const body = JSON.stringify({
            id: props.editSessionId,
        });
        fetch('/api/update_session', {
            method: 'POST',
            body: body,
        }).then((res) => {
            res.json().then((res_data) => {
                console.log("Updated session");
                console.log(res_data);
            });
            props.handleClose();
        }).catch((error) => {
            console.log(error);
        });
    };

    return (
        <Modal overflow={false} backdrop='static' open={props.visibility} onClose={props.handleClose}>
            <Modal.Header>
                <h4>{props.editSession ? "Edit":"Add"} Session</h4>
                <Steps current={formIndex}>
                    <Steps.Item title="Duties" />
                    <Steps.Item title="Songs" />
                </Steps>
                <SongModal visibility={addSongShow} handleClose={handleAddSongClose} />
            </Modal.Header>
            <Modal.Body>
                <Animation.Collapse unmountOnExit in={formIndex == 0} >
                    <Form fluid
                        onChange={setDutyFormData} formValue={dutyFormData} style={{marginBottom:'1em'}} >
                        <Form.Group controlId="datePicker">
                            <Form.ControlLabel>Date:</Form.ControlLabel>
                            <Form.Control name="date" accepter={DatePicker}
                                block oneTap size="md" value={dateValue} onChange={(value: Date|null)=>setDateValue(value)}
                                errorMessage={dutyFormData?.date ? '' : 'This field is required'}
                                errorPlacement='bottomStart'
                            />
                        </Form.Group>
                        <Form.Group controlId="worship_leader">
                            <InputGroup style={{width: '100%'}} >
                                <InputGroup.Addon>
                                    <BsFillPersonFill />
                                </InputGroup.Addon>
                                <Form.Control
                                    name="worship_leader"
                                    placeholder="Worship Leader"
                                    errorMessage={dutyFormData?.worship_leader ? '' : 'This field is required'}
                                    errorPlacement='bottomStart'
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="vocalist">
                            <InputGroup style={{width: '100%'}} >
                                <InputGroup.Addon>
                                    <IoPersonAdd />
                                </InputGroup.Addon>
                                <Form.Control
                                    name="vocalist"
                                    placeholder="Vocalist"
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="keyboard">
                            <InputGroup style={{width: '100%'}} >
                                <InputGroup.Addon>
                                    <MdPiano />
                                </InputGroup.Addon>
                                <Form.Control
                                    name="keyboard"
                                    placeholder="Keyboard"
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="guitar">
                            <InputGroup style={{width: '100%'}} >
                                <InputGroup.Addon>
                                    <GiGuitar />
                                </InputGroup.Addon>
                                <Form.Control
                                    name="guitar"
                                    placeholder="Guitar"
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="drums">
                            <InputGroup style={{width: '100%'}} >
                                <InputGroup.Addon>
                                    <FaDrumSteelpan />
                                </InputGroup.Addon>
                                <Form.Control
                                    name="drums"
                                    placeholder="Drums"
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="sound_personnel">
                            <InputGroup style={{width: '100%'}} >
                                <InputGroup.Addon>
                                    <AiFillSound />
                                </InputGroup.Addon>
                                <Form.Control
                                    name="sound_personnel"
                                    placeholder="Sound_personnel"
                                />
                            </InputGroup>
                        </Form.Group>
                    </Form>
                </Animation.Collapse>
                <Animation.Collapse unmountOnExit in={formIndex == 1} >
                    <Form fluid >
                        <Form.Group>
                            <IconButton block appearance="primary" color="green" icon={<Plus />} onClick={() => setAddSongShow(true)} >
                                Add Song
                            </IconButton>
                        </Form.Group>
                        <Form.Group>
                            <InputGroup style={{width: '100%'}} >
                                <InputGroup.Addon>
                                    <FaMusic />
                                </InputGroup.Addon>
                                <SongAutocomplete onSelect={(song_id: number) => setSongList([...songList, song_id])}
                                />
                            </InputGroup>
                        </Form.Group>
                        <Form.Group>
                            <List sortable onSort={handleSongSort}>
                                {songList.map((song_id, index) => (
                                    <SongListItem key={index} index={index} song_id={song_id} />
                                ))}
                            </List>
                        </Form.Group>
                    </Form>
                </Animation.Collapse>
            </Modal.Body>
            <Modal.Footer>
                {formIndex == 0 && 
                    <Button disabled={pauseModal || !dutyFormData?.worship_leader || !dutyFormData?.date} onClick={() => setFormIndex(formIndex + 1)} color="blue" appearance="primary">
                        Next
                    </Button>
                }
                {formIndex == 1 &&
                    <>
                        <Button onClick={() => setFormIndex(formIndex - 1)} color="blue" appearance="primary">
                            Back
                        </Button>
                        <Button disabled={pauseModal} onClick={props.editSession ? updateSession : addSession} color="green" appearance="primary">
                            Confirm
                        </Button>
                    </>
                }
                <Button onClick={props.handleClose} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default SessionModal;