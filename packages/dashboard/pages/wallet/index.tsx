import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import { AppPage } from '../../components/app-page';

import { Typography, Grid, Paper, Button } from '@mui/material';

import { WalletCard } from '../../components/wallet-card';

import { config } from '../../config';

import { getWallet, createWallet } from './facade';

const Wallet: NextPage = () => {
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
        <title>{config.method} | Wallet</title>
        <meta name="description" content={config.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              {wallet ? (
                <WalletCard wallet={wallet} />
              ) : (
                <Paper
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
                    You don't have a wallet yet.
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    We'll need to create one to help you manage identifiers.
                  </Typography>
                  <Button
                    color={'secondary'}
                    variant={'contained'}
                    onClick={() => {
                      createWallet();
                    }}
                  >
                    Create Wallet
                  </Button>
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
