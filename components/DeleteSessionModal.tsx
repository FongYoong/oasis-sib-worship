import { useState } from 'react'
import { Modal, Stack, Button, Tag } from 'rsuite'
import { SessionProps } from './types'
import { BsFillPersonFill } from 'react-icons/bs'
import { Image as ImageIcon } from '@rsuite/icons'

interface DeleteSessionModalProps {
    visibility: boolean,
    handleClose: () => void,
    onSuccess?: () => void,
    sessionData?: SessionProps
}

const DeleteSessionModal = (props: DeleteSessionModalProps) => {

    const onSuccess = () => {
        if (props.onSuccess) {
            props.onSuccess();
        }
        props.handleClose();
    }

    const deleteSession = () => {
        const body = JSON.stringify({
            id: props.sessionData?.id,
        });
        fetch('/api/delete_session', {
            method: 'POST',
            body: body,
        }).then((res) => {
            res.json().then((res_data) => {
                console.log("Deleted session");
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
                <Modal.Title>Delete Session</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Delete <Tag size="lg">{props.sessionData?.date}</Tag>?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button disabled={!props.sessionData} onClick={deleteSession} color="red" appearance="primary">
                    Confirm
                </Button>
                <Button onClick={props.handleClose} appearance="subtle">
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    )
}

export default DeleteSessionModal;