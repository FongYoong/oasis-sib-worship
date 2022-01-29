import { useState } from 'react'
import { Modal, Stack, Button, Tag, InputGroup, Input } from 'rsuite'
import { SessionProps } from '../lib/types'
import { BsFillPersonFill } from 'react-icons/bs'

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
                <Stack direction='column' spacing='1em' >
                    <p>Delete <Tag size="lg">{props.sessionData?.date.toLocaleDateString()}</Tag>?</p>
                    <InputGroup>
                        <InputGroup.Addon>
                            <BsFillPersonFill />
                        </InputGroup.Addon>
                        <Input
                            placeholder={props.sessionData?.worship_leader}
                            readOnly={true}
                        />
                    </InputGroup>
                </Stack>
                
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