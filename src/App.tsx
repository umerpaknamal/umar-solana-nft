import "./App.css";
import { useMemo } from "react";

import Home from "./Home";
import { Connection } from "@solana/web3.js";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import { ConnectionProvider, WalletProvider} from "@solana/wallet-adapter-react";
import { WalletDialogProvider } from "@solana/wallet-adapter-material-ui";

import { createTheme, ThemeProvider } from "@mui/material";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SlopeWalletAdapter } from "@solana/wallet-adapter-slope";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { SolletWalletAdapter, SolletExtensionWalletAdapter } from "@solana/wallet-adapter-sollet";

import ks from './images/KS.png';

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

let error: string | undefined = undefined;

const getCandyMachineId = (): string => {
  if (!process.env.REACT_APP_CANDY_MACHINE_ID) {
    error = "Missing Candy Machine ID. Please add it as REACT_APP_CANDY_MACHINE_ID value in .env file";
    throw new Error(error);
  }
  return process.env.REACT_APP_CANDY_MACHINE_ID as string;
};

const getNetwork = (): string => {
  if (!process.env.REACT_APP_SOLANA_NETWORK) {
    error = "Missing Solana Network. Please add it as REACT_APP_SOLANA_NETWORK value in .env file";
    throw new Error(error);
  }
  return process.env.REACT_APP_SOLANA_NETWORK as string;
};

const getRpcHost = (): string => {
  if (!process.env.REACT_APP_SOLANA_RPC_HOST) {
    error = "Missing RPC Host. Please add it as REACT_APP_SOLANA_RPC_HOST value in .env file";
    throw new Error(error);
  }
  return process.env.REACT_APP_SOLANA_RPC_HOST as string;
};



const App = () => {
  let candyMachineId: string = "";
  let connection: Connection | null = null;;
  let rpcHost: string = "";
  let endpoint: string | null = "";
  let network: WalletAdapterNetwork = "devnet" as WalletAdapterNetwork;
  let wallets: any = [];
  let isError = false;

  try {
    isError = false;
    candyMachineId = getCandyMachineId();
    network = getNetwork() as WalletAdapterNetwork;
    rpcHost = getRpcHost();
  
    connection = new Connection(rpcHost);
    
  } catch (e) {
    isError = true;
    console.error(e);
  }

  endpoint = useMemo(() => {
    return isError ? null : rpcHost;
  }, [isError]);
  
  wallets = useMemo(
    () => {
      return isError ? [] :  [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter({ network }),
        new SlopeWalletAdapter(),
        new SolletWalletAdapter({ network }),
        new SolletExtensionWalletAdapter({ network }),
      ]
    },
    [isError]
  );

  const toRender = isError ? (
    <div style={{
      width: '100%',
      marginTop: '20%',
      textAlign: 'center',
      color: 'white',
    }}>
      {error}
    </div>
  ) : (
    <ThemeProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint as string}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletDialogProvider>
            <Home
              candyMachineId={candyMachineId}
              connection={connection as Connection}
              txTimeout={500000}
              rpcHost={rpcHost}
              network={network}
              error={error}
            />
          </WalletDialogProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  )

  return (
    <>
      <div style={{
        width: '100%'
      }}>
        <img src={ks} alt="KeyStrokes" height="20%" style={{
            marginTop: '5%',
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
        <div style={{
            width: '100%',
          }}
        >
          <a href="https://www.youtube.com/@Key_Strokes" style={{
            textAlign: 'center',
            display: 'block',
            color: '#c9aeff',
          }}>Find me on YouTube!</a>
        </div>
      </div>
      { toRender }
    </>
  );
};

export default App;
