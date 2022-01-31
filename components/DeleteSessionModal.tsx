import { useState } from 'react'
import { Modal, Stack, Button, InputGroup, Input, Divider } from 'rsuite'
import { SUCCESS_CODE } from '../lib/status_codes'
import { SessionProps } from '../lib/types'
import PasswordInput from './PasswordInput'
import { BsFillPersonFill } from 'react-icons/bs'
import { MdDateRange } from 'react-icons/md'

interface DeleteSessionModalProps {
    visibility: boolean,
    handleClose: () => void,
    onSuccess?: () => void,
    sessionData?: SessionProps
}

const DeleteSessionModal = (props: DeleteSessionModalProps) => {

    const [password, setPassword] = useState<string>('')
    const [passwordError, setPasswordError] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)

    const onSuccess = () => {
        if (props.onSuccess) {
            props.onSuccess();
        }
        setPassword('');
        setLoading(false);
        props.handleClose();
    }

    const deleteSession = () => {
        setLoading(true);
        const body = JSON.stringify({
            id: props.sessionData?.id,
            password
        });
        fetch('/api/delete_session', {
            method: 'POST',
            body: body,
        }).then((res) => {
            if (res.status == SUCCESS_CODE) {
                res.json().then((res_data) => {
                    console.log("Deleted session");
                    console.log(res_data);
                });
                onSuccess();
            }
            else {
                throw new Error()
            }
        }).catch((error) => {
            console.log(error);
            setPasswordError(true);
            setLoading(false);
        });
    };

    return (
        <Modal overflow={false} open={props.visibility} onClose={props.handleClose}>
            <Modal.Header>
                <Modal.Title>Delete Session</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Stack direction='column' spacing='1em' >
                    <p>Are you sure?</p>
                    <InputGroup>
                        <InputGroup.Addon>
                            <MdDateRange />
                        </InputGroup.Addon>
                        <Input
                            placeholder={props.sessionData?.date.toLocaleDateString()}
                            readOnly={true}
                        />
                    </InputGroup>
                    <InputGroup>
                        <InputGroup.Addon>
                            <BsFillPersonFill />
                        </InputGroup.Addon>
                        <Input
                            placeholder={props.sessionData?.worship_leader}
                            readOnly={true}
                        />
                    </InputGroup>
                    <Divider style={{marginTop:'1em', marginBottom:'0', height: '0.2em', width: '30vw'}} />
                    <PasswordInput setPassword={setPassword} passwordError={passwordError} setPasswordError={setPasswordError} />
                </Stack>
                
            </Modal.Body>
            <Modal.Footer>
                <Button loading={loading} disabled={!props.sessionData} onClick={deleteSession} color="red" appearance="primary">
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