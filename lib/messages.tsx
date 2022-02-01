import { Tag, toaster, Message } from 'rsuite';

export const CopyClipboardMessage = (value: string, message: string | JSX.Element) => {
    toaster.push(
        <Message showIcon closable duration={5000} type='info' >
            <Tag> {value} </Tag> <br />
            {message}
        </Message>
    , {placement: 'topCenter'});
}

export const SuccessMessage = (message: string | JSX.Element) => {
    toaster.push(
        <Message showIcon closable duration={1500} type='success' >
            {message}
        </Message>
    , {placement: 'topCenter'});
}

export const ErrorMessage = (message: string | JSX.Element) => {
    toaster.push(
        <Message showIcon closable duration={3000} type='error' >
            {message}
        </Message>
    , {placement: 'topCenter'});
}
