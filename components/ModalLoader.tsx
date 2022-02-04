
import { Notification, Loader, Stack, Animation } from 'rsuite'

const ModalLoader = ({message} : {message: string}) => {
    return (
        <Animation.Slide in placement='bottom' >
            <Notification type="info" header={
                <Stack spacing='1em' >
                    <h5 style={{color:'white'}}>{message}</h5>
                    <Loader inverse />
                </Stack>
            }
            style={{
                position: 'fixed',
                bottom: '10vh',
                backgroundColor: '#4E4E6A',
                zIndex: 1000}
            }>
            </Notification>
        </Animation.Slide>
    )
}

export default ModalLoader;