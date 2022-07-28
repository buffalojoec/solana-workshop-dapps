import './App.css';
import { WalletContextProvider } from './contexts/WalletContextProvider';
import { SolanaTwitter } from './components/SolanaTwitter';

function App() {
  return (
    <>
      <WalletContextProvider>
          <SolanaTwitter/>
      </WalletContextProvider>
    </>
  );
}

export default App;
