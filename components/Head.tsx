import { Avatar, Stack, Nav } from 'rsuite';
import NextHead from 'next/head';
import { FcNext } from 'react-icons/fc';

interface HeadProps {
  title: string,
  description: string
}

const Head = (props: HeadProps) => {
    return (
      <>
        <NextHead>
          <title>Oasis SIB Worship - {props.title}</title>
          <meta name={props.title} content={props.description} />
          <link rel="icon" href="/favicon.ico" />
        </NextHead>
        <Stack direction='row' alignItems='center' spacing='1em' style={{marginBottom: '0em'}} >
          <Avatar src="images/oasis_sib_logo.jpg" alt="oasis_sib_logo" onClick={() => {
            const w = window.open('https://www.facebook.com/theoasissibs2/', '_blank');
            if(w) {
              w.focus()
            }
          }}
          
          />
        </Stack>
        <Nav appearance='tabs' style={{marginBottom: '1em'}} >
          <Nav.Item>Home</Nav.Item>
          <Nav.Item>All Songs</Nav.Item>
          <Nav.Item>About</Nav.Item>
        </Nav>
      </>
    )
}

export default Head;