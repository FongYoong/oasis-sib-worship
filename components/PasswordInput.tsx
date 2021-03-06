import { Stack, InputGroup, Form, Divider } from 'rsuite'
import { RiLockPasswordFill } from 'react-icons/ri'

const PasswordInput = ({ autoFocus=false, setPassword, passwordError, setPasswordError }: { autoFocus?: boolean, setPassword: (value: string) => void, passwordError: boolean, setPasswordError: (value: boolean) => void }) => {
    return (
        <>
            <Divider style={{marginTop:'1em', marginBottom:'1em', height: '0.2em', width: '100%'}} />
            <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
                <h4>Please type password to proceed</h4>
                <Form>
                    <Form.Group controlId={'input-1'}>
                        <InputGroup>
                            <InputGroup.Addon>
                                <RiLockPasswordFill />
                            </InputGroup.Addon>
                            <Form.Control
                                onChange={(value: string) => {
                                    setPassword(value);
                                    setPasswordError(false);
                                }}
                                name="password" type="password" autoComplete="off" autoFocus={autoFocus}
                                placeholder="Password"
                                readOnly={false}
                                errorPlacement='bottomStart'
                                errorMessage={passwordError ? 'Incorrect password' : ''}
                            />
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Stack>
        </>
    )
}

export default PasswordInput;