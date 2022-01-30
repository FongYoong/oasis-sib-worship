import 'rsuite/dist/rsuite.min.css'
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.bubble.css';
import '../styles/global.css';
import { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
export default MyApp
