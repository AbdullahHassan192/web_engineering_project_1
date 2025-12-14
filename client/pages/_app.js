import '../styles/globals.css'
import ConnectionStatus from '../components/ConnectionStatus'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <ConnectionStatus />
    </>
  )
}















