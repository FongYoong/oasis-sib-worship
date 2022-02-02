// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react'
import { Avatar, Stack, Nav } from 'rsuite'
import { NavItemProps } from 'rsuite'
import Link from 'next/link'
import NextHead from 'next/head'
import hoverStyles from '../styles/hover.module.css'
import { PageName } from '../lib/types'
import { domainUrl } from '../lib/utils'

interface HeadProps {
  title?: PageName,
  description?: string
}

// eslint-disable-next-line react/display-name
const NavLink = React.forwardRef((props: NavItemProps, ref: React.LegacyRef<HTMLAnchorElement>) => {
  const { href, ...rest } = props;
  return (
    <Link href={href as string} >
      <a ref={ref} {...rest as React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>} />
    </Link>
  );
});

const Head = (props: HeadProps) => {
    return (
      <>
        <NextHead>
          <title>Oasis SIB Worship - {props.title}</title>
          <meta name={props.title} content={props.description} />
          <link rel="icon" href="/favicon.ico" />
        </NextHead>
        <Stack direction='row' alignItems='center' spacing='1em' style={{
            marginBottom: '0em'
          }} >
          <Avatar src={`http://${domainUrl}/images/oasis_sib_logo.jpg`} alt="oasis_sib_logo"
              className={hoverStyles.hover_glow}
              style={{
                cursor: 'pointer',
                margin: "1em",
                outlineStyle: 'solid',
                outlineWidth: '1px',
                outlineColor: "#9e9e9e"
              }}
              onClick={() => {
                const w = window.open('https://www.facebook.com/theoasissibs2/', '_blank');
                if(w) {
                  w.focus()
                }
            }}
          />
          <Nav activeKey={props.title} appearance='tabs' style={{marginBottom: '1em'}} >
            <Nav.Item as={NavLink} href="/" eventKey={PageName.Home} >Home</Nav.Item>
            <Nav.Item as={NavLink} href="/all_songs" eventKey={PageName.AllSongs}  >All Songs</Nav.Item>
            <Nav.Item as={NavLink} href="/about" eventKey={PageName.About} >About</Nav.Item>
          </Nav>
        </Stack>

      </>
    )
}

export default Head;