import 'rsuite/dist/rsuite.min.css'
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import '../styles/global.css';
import { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { Container } from 'rsuite'
import NextNProgress from 'nextjs-progressbar'
import { LazyMotion, AnimatePresence, domAnimation, m } from "framer-motion"
import { fadeOnly } from '../lib/animations'
import { resolvePageRoute } from '../lib/utils'
import Head from '../components/Head'
import Footer from '../components/Footer'

const animation = fadeOnly;

function MyApp({ Component, pageProps }: AppProps) {

  const router = useRouter();
  const title = resolvePageRoute(router.pathname);

  // const [pageLoading, setPageLoading] = useState<boolean>(false);
  // useEffect(() => {
  //   const handleStart = () => { setPageLoading(true); };
  //   const handleComplete = () => { setPageLoading(false); };

  //   router.events.on('routeChangeStart', handleStart);
  //   router.events.on('routeChangeComplete', handleComplete);
  //   router.events.on('routeChangeError', handleComplete);
  // }, [router]);


  return (
    <>
      <NextNProgress />
      <Container className='page' >
        <Head title={title} description={title} />
        <LazyMotion features={domAnimation}>
          <AnimatePresence exitBeforeEnter>
            <m.div
              key={router.route.concat(animation.name)}
              style={{
                display: "flex",
                position: "relative",
                justifyContent: 'center',
                alignItems: 'center',
                height: "100%",
                width: "96vw"
              }}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={animation.variants}
              transition={animation.transition}
            >
              <Component {...pageProps} />
            </m.div>
          </AnimatePresence>
        </LazyMotion>
        <Footer />
      </Container>
    </>
  )
}
export default MyApp


// pageLoading ? (<Loader size='lg' />) : 