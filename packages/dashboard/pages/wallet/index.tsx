import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import { AppPage } from '../../components/app-page';

import { Typography, Grid, Paper, Button, Box, TextField } from '@mui/material';

import { WalletCard } from '../../components/wallet-card';

import { getWallet, createWallet } from '../../core/facade';
import { uiConfigs } from '../../config';

export async function getServerSideProps(context: any) {
  return {
    props: uiConfigs,
  };
}

const didMnemonic =
  'sell antenna drama rule twenty cement mad deliver you push derive hybrid';
const didHdPath = `m/44'/0'/0'/0/0`;

const Wallet: NextPage<any> = ({
  description,
  method,
  logoLight,
  logoDark,
}) => {
  const [wallet, setWallet]: any = React.useState(null);

  React.useEffect(() => {
    const w = getWallet();
    if (wallet === null && w !== null) {
      setWallet(w);
    }
  }, [wallet, setWallet]);

  return (
    <div>
      <Head>
        <title>{method} | Wallet</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage logoLight={logoLight} logoDark={logoDark} method={method}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              {wallet ? (
                <WalletCard wallet={wallet} />
              ) : (
                <Paper>
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      maxWidth: '75%',
                      margin: 'auto',
                    }}
                  >
                    <Typography variant={'h3'} gutterBottom>
                      Get Started
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                      {`You don't have a wallet yet.`}
                    </Typography>
                    <Typography sx={{ mb: 2 }}>
                      {`We'll need to create one to help you manage identifiers.`}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      textAlign: 'center',
                      margin: 'auto',
                      p: 2,
                    }}
                  >
                    <Box>
                      <TextField
                        label="Mnemonic"
                        variant="outlined"
                        fullWidth
                        value={didMnemonic}
                        disabled
                      />
                    </Box>
                    <Box mt={2}>
                      <TextField
                        label="HD Path"
                        variant="outlined"
                        fullWidth
                        value={didHdPath}
                        disabled
                      />
                    </Box>
                    <Button
                      sx={{ m: 2 }}
                      color={'secondary'}
                      variant={'contained'}
                      onClick={() => {
                        createWallet({
                          mnemonic: didMnemonic,
                          hdpath: didHdPath,
                        });
                      }}
                    >
                      Create Wallet
                    </Button>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </AppPage>
      </main>
    </div>
  );
};

export default Wallet;
