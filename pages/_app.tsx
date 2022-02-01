import 'rsuite/dist/rsuite.min.css'
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import '../styles/global.css';
import { useState, useEffect } from 'react'
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { SpinnerRoundFilled } from 'spinners-react';

//import { Loader, Animation } from 'rsuite'

const PageLoader = () => {
  return (
    <div style={{
      zIndex: 1000,
      opacity: 0.3,
      background: 'black',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh'
    }}> 
      <SpinnerRoundFilled size='25vw' thickness={100} speed={100} color="#36ad47" style={{
        position: 'absolute',
        top: '0vh',
        left: '0vw'
      }} />
    </div>
  )
};

function MyApp({ Component, pageProps }: AppProps) {

  const router = useRouter();
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  useEffect(() => {
    const handleStart = () => { setPageLoading(true); };
    const handleComplete = () => { setPageLoading(false); };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);
  }, [router]);

  return (
    <>
      <Component {...pageProps} />
      {pageLoading && <PageLoader />}
      {/* {pageLoading && <Loader size='lg' content={<h2>Wait ah...</h2>} center backdrop />} */}
    </>

  )
}
export default MyApp


// pageLoading ? (<Loader size='lg' />) : 