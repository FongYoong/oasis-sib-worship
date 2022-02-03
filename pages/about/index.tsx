import { NextPage } from 'next'
import { Button, Stack, Divider } from 'rsuite';
import { BsGithub, BsYoutube } from 'react-icons/bs'
import hoverStyles from '../../styles/hover.module.css'

const AboutPage: NextPage = () => {

  return (
    <>
      <main>
        <Stack spacing='1em' direction='column' alignItems='center' justifyContent='center' >
          <h2 style={{textAlign:'center'}} >What&apos;s this for? 🤔</h2>
          <p style={{fontSize: '1.5em'}}>
            This website is intended for:
            <ul>
              <li>🎵&nbsp;<strong>Worship team</strong> to add songs to a centralized database which serves as a reference.</li>
              <li>📝&nbsp;<strong>Worship leaders</strong> to specify the order of songs and also additional info for each worship session which can be viewed by everyone.</li>
              <li>💻&nbsp;<strong>Media streamers</strong> to export these songs into coherent Powerpoint lyrics <strong>automatically</strong> with minimal effort.</li>
            </ul>
          </p>
          <Divider style={{height: '0.2em', width: '90vw'}} />
          <h2 style={{textAlign:'center'}} >I can&apos;t delete or edit songs. ✏️</h2>
          <p style={{fontSize: '1.5em'}}>
            For security purposes, a password 🔑 is required for edit/delete to prevent unwanted behaviour.
          </p>
          <Divider style={{height: '0.2em', width: '90vw'}} />
          <h2 style={{textAlign:'center'}} >I would like to report an issue. 🐛</h2>
          <p style={{fontSize: '1.5em'}}>
            If you face any issues with the website, feel free to contact <b>Chien Yoong</b> by WhatsApp or <a className='actualAnchor' href="mailto:fongyoong8@gmail.com">email</a>.
          </p>
          <Divider style={{height: '0.2em', width: '90vw'}} />
          <Stack wrap direction='row' justifyContent='center' spacing="1em" >
            <Button className={hoverStyles.hover_grow} appearance="primary" style={{
                backgroundColor: "black"
              }}
              onClick={() => {
                window.open("https://github.com/FongYoong/oasis-sib-worship", '_blank')
              }} >
                <BsGithub style={{marginRight: '1em'}} />GitHub
            </Button>
            <Button className={hoverStyles.hover_grow} appearance="primary" color="red"
              onClick={() => {
                window.open("https://www.youtube.com/channel/UCQMt50RI68HvV36hxqVLFgQ", '_blank')
              }} >
                <BsYoutube style={{marginRight: '1em'}} />YouTube
            </Button>
          </Stack>
        </Stack>
      </main>
    </>
  )
}

export default AboutPage
