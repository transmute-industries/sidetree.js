import React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';

import { AppPage } from '../../components/app-page';

import { Typography, Grid, Paper, Button, Box, TextField } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import MemoryIcon from '@mui/icons-material/Memory';
import IconButton from '@mui/material/IconButton';
import { WalletCard } from '../../components/wallet-card';

import { walletFactory, getWallet } from '../../core/facade';
import { uiConfigs } from '../../config';
import router from 'next/router';

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
  const [mnemonic, setMnemonic]: any = React.useState(didMnemonic);

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
                    <Typography sx={{ mb: 2 }}>
                      {`Never share your mnemonic with anyone.`}
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
                        value={mnemonic}
                        disabled
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="mnemonic generator"
                                color="secondary"
                                onClick={async () => {
                                  const m = await walletFactory
                                    .build()
                                    .toMnemonic();

                                  setMnemonic(m.value);
                                }}
                              >
                                <MemoryIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
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
                      color={'primary'}
                      variant={'contained'}
                      onClick={async () => {
                        const w = walletFactory.build();
                        const m: any = await w.toMnemonic(mnemonic);
                        w.add(m);
                        m.hdpath = didHdPath;
                        localStorage.setItem(
                          'sidetree.wallet',
                          JSON.stringify(w, null, 2)
                        );
                        console.log('created wallet.');
                        router.push('/create');
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
