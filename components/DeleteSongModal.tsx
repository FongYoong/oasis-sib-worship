import { useState } from 'react'
import { Modal, Stack, Button, Tag } from 'rsuite'
import { SongProps } from './types'
import { BsFillPersonFill } from 'react-icons/bs'
import { Image as ImageIcon } from '@rsuite/icons'

interface DeleteSongModalProps {
    visibility: boolean,
    handleClose: () => void,
    songData?: SongProps
}


const DeleteSongModal = (props: DeleteSongModalProps) => {

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
            props.handleClose();
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
                <p>Delete <Tag size="lg">{props.songData?.title}</Tag>?</p>
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