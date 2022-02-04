import { useState } from 'react'
import { Modal, Stack, Button, InputGroup, Input } from 'rsuite'
import { SUCCESS_CODE } from '../lib/status_codes'
import { SongProps } from '../lib/types'
import PasswordInput from './PasswordInput'
import { MdTitle } from 'react-icons/md'
import { BsFillPersonFill } from 'react-icons/bs'

interface DeleteSongModalProps {
    visibility: boolean,
    handleClose: () => void,
    onSuccess?: () => void,
    songData?: SongProps
}

const DeleteSongModal = (props: DeleteSongModalProps) => {

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

    const deleteSong = () => {
        setLoading(true);
        const body = JSON.stringify({
            id: props.songData?.id,
            password
        });
        fetch('/api/delete_song', {
            method: 'POST',
            body: body,
        }).then((res) => {
            if (res.status == SUCCESS_CODE) {
                res.json().then((res_data) => {
                    console.log("Deleted song");
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
                    <PasswordInput autoFocus={true} setPassword={setPassword} passwordError={passwordError} setPasswordError={setPasswordError} />
                </Stack>
            </Modal.Body>
            <Modal.Footer>
                <Button loading={loading} disabled={!props.songData || password.length < 1} onClick={deleteSong} color="red" appearance="primary">
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