import { useCallback, useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";

import styled from "styled-components";

import { Container, } from "@mui/material";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { SolanaMobileWalletAdapterWalletName } from "@solana-mobile/wallet-adapter-mobile";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import { CandyMachineState, getCandyMachineState, mint, NFT, getNftPrice } from "./candy-machine";

const ConnectButton = styled(WalletDialogButton)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, #813eee 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`;

export const MintButton = styled(Button)`
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #604ae5 0%, #813eee 100%);
  color: white;
`;

export interface HomeProps {
  candyMachineId: string;
  connection: Connection;
  txTimeout: number;
  rpcHost: string;
  network: WalletAdapterNetwork;
  error: string | undefined;
}

const Home = (props: HomeProps) => {
  const anchorWallet = useAnchorWallet();
  const { connect, connected, publicKey, wallet } = useWallet();
  const [candyMachine, setCandyMachine] = useState<CandyMachineState>();
  const [nft, setNft] = useState<NFT>();
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [error, setError] = useState("");
  
  const metaplex = new Metaplex(props.connection);

  const refreshCandyMachineState = useCallback(
    async () => {
      if (!publicKey) {
        return;
      }

      const candyMachine = await getCandyMachineState(metaplex, new PublicKey(props.candyMachineId));
      setCandyMachine(candyMachine);
    },
    [anchorWallet, props.candyMachineId, props.rpcHost]
  );

  const getMintButtonContent = () => {
    if (!candyMachine) {
      return "Loading...";
    }

    if (isUserMinting) {
      return "Minting in progress..";
    } else if (candyMachine.itemsRemaining === 0) {
      return "Sold out";
    } else {
      return "Mint";
    }
  };

  const mintButtonClicked = async () => {
    setIsUserMinting(true);

    metaplex.use(walletAdapterIdentity(wallet!.adapter));
    const nft = await mint(metaplex, candyMachine!);

    if (nft) {
      setNft(nft);
    } else {
      setError("Minting unsuccessful!");
    }
    
    setIsUserMinting(false);
    refreshCandyMachineState();
  }

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    refreshCandyMachineState,
  ]);

  useEffect(() => {
    (function loop() {
      setTimeout(() => {
        refreshCandyMachineState();
        loop();
      }, 20000);
    })();
  }, [refreshCandyMachineState]);

  return (
    <Container style={{ marginTop: 100 }}>
      <Container maxWidth="xs" style={{ position: "relative" }}>
        <Paper
          style={{
            padding: 24,
            backgroundColor: "#151A1F",
            borderRadius: 6,
          }}
        >
          {error || props.error ? (
            <Typography
            variant="h6"
            color="textPrimary"
            style={{
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {error || props.error}
          </Typography>
          ) : undefined}
          {!connected ? (
            <ConnectButton
              onClick={(e) => {
                if (
                  wallet?.adapter.name === SolanaMobileWalletAdapterWalletName
                ) {
                  connect();
                  e.preventDefault();
                }
              }}
            >
              <Typography variant="body2" color="textSecondary" style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "white",
                      textAlign: "center",
                    }}>
                Connect Wallet
              </Typography>
            </ConnectButton>
          ) : (
            <>
              <Grid
                container
                direction="row"
                justifyContent="center"
                wrap="nowrap"
              >
                <Grid item xs={3}>
                  <Typography variant="body2" color="textSecondary" style={{
                      textAlign: "center",
                    }}>
                    Remaining
                  </Typography>
                  <Typography
                    variant="h6"
                    color="textPrimary"
                    style={{
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  >
                    {`${candyMachine ? candyMachine.itemsRemaining : "Loading.."}`}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                    <Typography variant="body2" color="textSecondary">
                        Price
                    </Typography>
                    <Typography
                      variant="h6"
                      color="textPrimary"
                      style={{ fontWeight: "bold" }}
                    >
                      {`${candyMachine ? getNftPrice(candyMachine) + " SOL" : "Loading.."}`}
                    </Typography>
                  </Grid>
              </Grid>
              <Grid
                container
                direction="row"
                justifyContent="center"
                wrap="nowrap"
              >
                <MintButton onClick={async () => await mintButtonClicked()} disabled={isUserMinting || candyMachine?.itemsRemaining === 0}>
                  <Typography variant="body2" color="textSecondary" style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "white",
                      textAlign: "center",
                    }}>
                    { getMintButtonContent() }
                  </Typography>
                </MintButton>
              </Grid>
            </>
          )}
          {nft ? (
            <Grid item xs={3}>
              <img src={nft.imageUri} alt="NFT" width="100%"/>
            </Grid>
          ) : undefined}
        </Paper>
      </Container>
    </Container>
  );
};

export default Home;

