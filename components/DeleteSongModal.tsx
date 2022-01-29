import { useState } from 'react'
import { Modal, Stack, Button, InputGroup, Input } from 'rsuite'
import { SongProps } from '../lib/types'
import { MdTitle } from 'react-icons/md'
import { BsFillPersonFill } from 'react-icons/bs'

interface DeleteSongModalProps {
    visibility: boolean,
    handleClose: () => void,
    onSuccess?: () => void,
    songData?: SongProps
}

const DeleteSongModal = (props: DeleteSongModalProps) => {

    const onSuccess = () => {
        if (props.onSuccess) {
            props.onSuccess();
        }
        props.handleClose();
    }

    const deleteSong = () => {
        const body = JSON.stringify({
            id: props.songData?.id,
        });
        fetch('/api/delete_song', {
            method: 'POST',
            body: body,
        }).then((res) => {
            res.json().then((res_data) => {
                console.log("Deleted song");
                console.log(res_data);
            });
            onSuccess();
        }).catch((error) => {
            console.log(error);
        });
    };

    return (
        <Modal overflow={true} open={props.visibility} onClose={props.handleClose}>
            <Modal.Header>
                <Modal.Title>Delete Song</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Stack direction='column' spacing='1em' >
                    <p>Are you sure?</p>
                    <InputGroup>
                        <InputGroup.Addon>
                            <MdTitle />
                        </InputGroup.Addon>
                        <Input
                            placeholder={props.songData?.title}
                            readOnly={true}
                        />
                    </InputGroup>
                    <InputGroup>
                        <InputGroup.Addon>
                            <BsFillPersonFill />
                        </InputGroup.Addon>
                        <Input
                            placeholder={props.songData?.artist}
                            readOnly={true}
                        />
                    </InputGroup>
                </Stack>
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={!props.songData} onClick={deleteSong} color="red" appearance="primary">
                    Confirm
                </Button>
                <Button onClick={props.handleClose} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteSongModal;