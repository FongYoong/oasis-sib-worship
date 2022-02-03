import Link from 'next/link'
import { Stack, Divider, Button } from 'rsuite';

interface NotFoundProps {
    message: string,
    redirectLink: string
    redirectMessage: string
}

const NotFound = ({message, redirectLink, redirectMessage}: NotFoundProps) => {
    return (
        <>
            <h2 style={{textAlign: 'center'}} >
                Oops!
            </h2>
            <Divider style={{height: '0.2em', width: '90vw'}} />
            <h4 style={{textAlign: 'center'}} >
                {message} 😵
            </h4>
            <Divider style={{height: '0.2em', width: '90vw'}} />
            <Stack wrap direction='row' justifyContent='center' spacing="1em" >
                <Link passHref href={redirectLink}>
                    <Button appearance="primary" color="blue" >
                        {redirectMessage}
                    </Button>
                </Link>
            </Stack>
        </>
    )
}

export default NotFound;