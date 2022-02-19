import React, { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import CSS from 'csstype';
//import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { DragDropContextProps, DroppableProps, DraggableProps, DropResult } from 'react-beautiful-dnd'
const DragDropContext = dynamic<DragDropContextProps>(() =>
  import("react-beautiful-dnd").then((module) => module.DragDropContext)
);
const Droppable = dynamic<DroppableProps>(() =>
  import("react-beautiful-dnd").then((module) => module.Droppable)
);
const Draggable = dynamic<DraggableProps>(() =>
  import("react-beautiful-dnd").then((module) => module.Draggable)
);
import useSWR from 'swr'
import { Steps, DatePicker, Modal, Form, Stack, Button, IconButton, Animation, InputGroup, AutoComplete, Divider, Loader } from 'rsuite'
import { PickerInstance } from 'rsuite/Picker'
import { QuillLoadingContext, ReactQuill, quillModules, quillFormats } from './QuillLoad'
import ModalLoader from './ModalLoader'
const SongModal = dynamic(() => import('./SongModal'), {
    loading: () => <ModalLoader message="Loading song editor" />
})
//import SongModal from './SongModal'
import { json_fetcher } from '../lib/utils'
import { SuccessMessage, ErrorMessage } from '../lib/messages'
import { AiFillSound } from 'react-icons/ai'
import { GiGuitar } from 'react-icons/gi'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdPiano, MdDragIndicator } from 'react-icons/md'
import { FaDrumSteelpan, FaMusic } from 'react-icons/fa'
import { IoPersonAdd } from 'react-icons/io5'
import { Plus, Trash  } from '@rsuite/icons'
import { SongProps } from '../lib/types'
import hoverStyles from '../styles/hover.module.css'
import modalStyles from '../styles/modal.module.css'

interface SessionModalProps {
    visibility: boolean,
    handleClose: () => void,
    onSuccess?: () => void,
    editSession?: boolean,
    editSessionId?: number
}

const songs_fetcher = json_fetcher('GET');

const SongAutocomplete = ({ onSelect, onLoading }:{ onSelect: (song_id: number)=>void, onLoading?: (loading: boolean)=>void}) => {
    const autocompleteRef = useRef<PickerInstance>(null);
    const [searchText, setSearchText] = useState<string>('');
    const { data, isValidating, error } = useSWR(`/api/get_songs?searchText=${searchText}`, songs_fetcher);
    const songs = data ? data.songs.map((song: SongProps) => `${song.title} - ${song.artist}___:${song.id}`) : [];

    useEffect(() => {
        if (onLoading) {
            onLoading(isValidating)
        }
    }, [isValidating])

    return (
        <AutoComplete ref={autocompleteRef} value={searchText} data={songs} placeholder='Search song by title or artist'
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
                onSelect(song_id);
                if (autocompleteRef.current) {
                    setTimeout(() => {
                        if (autocompleteRef.current?.root) { 
                            (autocompleteRef.current.root.childNodes[0] as HTMLInputElement).value = '';
                        }
                        setSearchText('')
                    }, 0);
                }
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

const song_list_fetcher = json_fetcher('GET');

const SongListItem = ({ song_id, index, deleteHandler } : { song_id: number, index: number, deleteHandler: ()=>void }) => {
    const { data, isValidating, error } = useSWR(`/api/get_song/${song_id}`, song_list_fetcher);
    
    const getItemStyle = (isDragging: boolean, isDropAnimating: boolean, draggableStyle: CSS.Properties) => {
        if (!isDropAnimating) {
            return {
                ...draggableStyle,
                background: isDragging ? "#8cffab" : "white",
                boxShadow: isDragging ? "0px 0px 23px 5px rgba(115,115,115,0.77)" : ''
            }
        }
        return {
            ...draggableStyle,
            background: isDragging ? "#d4ffdf" : "white",
            transitionDuration: `0.1s`,
        };
    };

    return (
        <Draggable key={song_id} draggableId={song_id.toString()} index={index}>
            {(provided, snapshot) => {
                if (snapshot.isDragging) {
                    (provided.draggableProps.style as CSS.Properties).left = undefined;
                    (provided.draggableProps.style as CSS.Properties).top = undefined;
                }
                return (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                            snapshot.isDragging,
                            snapshot.isDropAnimating,
                            provided.draggableProps.style as CSS.Properties
                        )}
                    >
                        <Stack direction='row' justifyContent='space-between' style={{
                                paddingTop: '1em', paddingBottom: '1em',
                                borderTop:'2px solid #002cb0',
                                borderBottom:'2px solid #002cb0',
                                borderRadius:'0.5em'
                            }} >
                            <Stack spacing='1em' >
                                <MdDragIndicator />
                                <h4>
                                    {index+1}
                                </h4>
                                <Divider vertical />
                                <Stack spacing='1em' >
                                    { data && <>
                                        <h5>
                                            {data.title}
                                        </h5>
                                        <p>
                                            {data.artist}
                                        </p>
                                    </> }
                                    { !data && <Loader /> }
                                </Stack>
                            </Stack>
                            <IconButton appearance="primary" color="red" icon={<Trash />} onClick={deleteHandler} />
                        </Stack>
                    </div>
            )}}
        </Draggable>
    )
}

const session_fetcher = json_fetcher('GET');

const initialSessionInfo = 'Additional info here'

const SessionModal = (props: SessionModalProps) => {
    const [formIndex, setFormIndex] = useState<number>(0);
    const [dateValue, setDateValue] = useState<Date|null>(null);
    const [dutyFormData, setDutyFormData] = useState<Record<string, string>|undefined>(undefined);
    const [sessionInfo, setSessionInfo] = useState<string>(props.editSession ? '' : initialSessionInfo);
    const [addSongShow, setAddSongShow] = useState<boolean>(false);
    const [songModalLoad, setSongModalLoad] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [autocompleteLoading, setAutocompleteLoading] = useState<boolean>(false);
    const handleAddSongClose = () => {
        setAddSongShow(false);
    }
    
    const [songList, setSongList] = useState<number[]>([]);

    // interface MovedItemInfo {oldIndex: number, newIndex: number}
    // const handleSongSort = (props: MovedItemInfo | undefined) => {
    //     const moveData = songList.splice(props?.oldIndex as number, 1);
    //     const newData = [...songList];
    //     newData.splice(props?.newIndex as number, 0, moveData[0]);
    //     setSongList(newData);
    // };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            // dropped outside the list
            return;
        }
        const moveData = songList.splice(result.source.index, 1);
        const newData = [...songList];
        newData.splice(result.destination.index, 0, moveData[0]);
        setSongList(newData);
    }

    const { data, isValidating, error, mutate } = useSWR(props.editSession ? `/api/get_session/${props.editSessionId}` : null, session_fetcher, {
        revalidateIfStale: false,
        revalidateOnFocus: false,
        revalidateOnReconnect: false
      });
      
    useEffect(() => {
        if(data) {
            setDateValue(new Date(data.date))
            setDutyFormData(data)
            setSongList(data.songs)
            setSessionInfo(data.info)
        }
    }, [data]);

    const pauseModal = loading || isValidating || (props.editSession && !data);
    const validForm = !pauseModal && dutyFormData?.worship_leader && dutyFormData?.date;

    const resetModal = () => {
        setDutyFormData(undefined)
        setFormIndex(0);
    }
    const onSuccess = (message: string) => {
        if (props.onSuccess) {
            props.onSuccess();
        }
        SuccessMessage(message);
        resetModal();
        setLoading(false);
        closeModal();
    }
    const onFailure = (message: string) => {
        setLoading(false);
        ErrorMessage(message)
    }

    const addSession = () => {
        setLoading(true);
        const body = JSON.stringify({
            ...dutyFormData,
            date: dateValue ? dateValue : new Date(),
            songs: songList.join(','),
            info: sessionInfo
        });
        fetch('/api/add_session', {
            method: 'POST',
            body: body,
        }).then((res) => {
            res.json().then((res_data) => {
                console.log("Added session");
                console.log(res_data);
            });
            onSuccess("Added session");
        }).catch((error) => {
            console.log(error);
            onFailure("Failed to add session");
        });
    };

    const updateSession = () => {
        setLoading(true);
        const body = JSON.stringify({
            ...dutyFormData,
            id: props.editSessionId,
            date: dateValue ? dateValue : new Date(),
            songs: songList.join(','),
            info: sessionInfo
        });
        fetch('/api/update_session', {
            method: 'POST',
            body: body,
        }).then((res) => {
            res.json().then((res_data) => {
                console.log("Updated session");
                console.log(res_data);
            });
            mutate();
            onSuccess("Updated session");
        }).catch((error) => {
            console.log(error);
            onFailure("Failed to update session");
        });
    };

    const closeModal = () => {
        if (props.editSession) {
            resetModal();
        }
        props.handleClose();
    }

    return (
        <QuillLoadingContext.Provider value={setLoading} >
            <Modal overflow={false} backdrop={false} open={props.visibility} onClose={closeModal} >
                {isValidating &&
                    <Loader style={{zIndex: 1000}} backdrop center content="Fetching session..." />
                }
                <div className={modalStyles.modalBackground} />
                <Modal.Header>
                    <h4>{props.editSession ? "Edit":"Add"} Session</h4>
                    <Steps current={formIndex}>
                        <Steps.Item title="Duties" className={hoverStyles.hover_grow} onClick={() => {
                            setFormIndex(0);
                        }} />
                        <Steps.Item title="Songs" className={hoverStyles.hover_grow} onClick={() => {
                            if (validForm)
                            {
                                setFormIndex(1);
                            }
                        }} />
                        <Steps.Item title="Info" className={hoverStyles.hover_grow} onClick={() => {
                            if (validForm)
                            {
                                setFormIndex(2);
                            }
                        }} />
                    </Steps>
                    {songModalLoad && <SongModal visibility={addSongShow} handleClose={handleAddSongClose} /> }
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
                                    readOnly={pauseModal}
                                    placement="bottomStart"
                                    onClick={(event: React.MouseEvent<Element, MouseEvent>) => event.preventDefault()}
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
                                        readOnly={pauseModal}
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
                                        readOnly={pauseModal}
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
                                        readOnly={pauseModal}
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
                                        readOnly={pauseModal}
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
                                        readOnly={pauseModal}
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
                                        readOnly={pauseModal}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Form>
                    </Animation.Collapse>
                    <Animation.Collapse unmountOnExit in={formIndex == 1} >
                        <Form fluid >
                            <Form.Group>
                                <IconButton disabled={pauseModal} block appearance="primary" color="green" icon={<Plus />}
                                    onClick={() => {
                                        setSongModalLoad(true);
                                        setAddSongShow(true);
                                    }} >
                                    Create New Song
                                </IconButton>
                            </Form.Group>
                            <Form.Group>
                                <InputGroup style={{width: '100%'}} >
                                    <InputGroup.Addon>
                                        <FaMusic />
                                    </InputGroup.Addon>
                                    <SongAutocomplete onSelect={(song_id: number) => {
                                            if (songList.includes(song_id)) {
                                                ErrorMessage("Selected song already in the list.")
                                            }
                                            else {
                                                setSongList([...songList, song_id])
                                            }
                                        }}
                                        onLoading={(value) => setAutocompleteLoading(value)}
                                    />
                                    <InputGroup.Addon>
                                        {autocompleteLoading && <Loader />}
                                    </InputGroup.Addon>
                                </InputGroup>
                            </Form.Group>
                            <Form.Group>
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="droppable">
                                        {(provided, snapshot) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                style={{
                                                    background: snapshot.isDraggingOver ? "#fffad4" : "white",
                                                }}
                                            >
                                                {songList.length > 0 && songList.map((song_id: number, index: number) => (
                                                    <SongListItem key={index} song_id={song_id} index={index} 
                                                        deleteHandler={() => {
                                                            setSongList([...songList.slice(0,index), ...songList.slice(index+1)])                                            
                                                        }}
                                                    />
                                                ))}
                                                {songList.length <=0 && <h4>Use the search bar to add songs.</h4> }
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </DragDropContext>
                            </Form.Group>
                        </Form>
                    </Animation.Collapse>
                    <Animation.Collapse unmountOnExit in={formIndex == 2} >
                        <div>
                            <ReactQuill readOnly={pauseModal} theme="snow" modules={quillModules} formats={quillFormats}
                                value={sessionInfo} onChange={setSessionInfo}
                            />
                        </div>
                    </Animation.Collapse>
                </Modal.Body>
                <Modal.Footer>
                    {formIndex >= 1 &&
                        <Button disabled={pauseModal} onClick={() => setFormIndex(formIndex - 1)} color="blue" appearance="primary">
                            Back
                        </Button>
                    }
                    {formIndex >= 0 && formIndex < 2 && 
                        <Button disabled={!validForm} onClick={() => setFormIndex(formIndex + 1)} color="blue" appearance="primary">
                            Next
                        </Button>
                    }
                    {formIndex == 2 &&
                        <Button loading={pauseModal} disabled={pauseModal} onClick={props.editSession ? updateSession : addSession} color="green" appearance="primary">
                            Confirm
                        </Button>
                    }
                    <Button onClick={closeModal} appearance="subtle">
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </QuillLoadingContext.Provider>
    )
}

export default SessionModal;

/* const SongListItem = ({ song_id, index, deleteHandler } : { song_id: number, index: number, deleteHandler: ()=>void }) => {
    const { data, isValidating, error } = useSWR(`/api/get_song/${song_id}`, song_list_fetcher);

    return (
        <List.Item index={index} >
            <Stack direction='row' justifyContent='space-between' >
                <Stack spacing='1em' >
                    <MdDragIndicator />
                    <h5>
                        {index+1}. {data ? `${data.title}  ${data.artist}` : 'Loading...'}
                    </h5>
                </Stack>
                <IconButton appearance="primary" color="red" icon={<Trash />} onClick={deleteHandler} />
            </Stack>
        </List.Item>
    )
}
 */