import type { NextPage } from 'next';
import Head from 'next/head';

import * as React from 'react';
import { Box, Typography, Hidden, Button, Grid } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

import { Theme } from '../components/theme';
import { DarkModeToggle } from '../components/dark-mode-toggle';
import { CompanyLogo } from '../components/company-logo';
import { ParticlesBlock } from '../components/particles-block';
import { Card } from '../components/card';
import { SectionHeader } from '../components/section-header';
import { useRouter } from 'next/router';

import { config } from '../config';

const Home: NextPage = () => {
  const router = useRouter();
  return (
    <div>
      <Head>
        <title>{config.method} | Dashboard</title>
        <meta name="description" content={config.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Theme>
          <CssBaseline />
          <ParticlesBlock>
            <div style={{ marginTop: '140px' }}>
              <Typography variant={'h2'} color={'primary'} gutterBottom>
                {config.method}
              </Typography>
              <Hidden smDown>
                <Typography variant={'h3'} style={{ marginBottom: '32px' }}>
                  {config.description}
                </Typography>
              </Hidden>
              <CompanyLogo sx={{ height: '48px' }} />
            </div>
          </ParticlesBlock>
          <Box>
            <SectionHeader
              title={config.features.title}
              description={config.features.description}
            />
            <Grid container sx={{ p: 2 }} spacing={2}>
              <Grid item xs={4}>
                <Card
                  title="Manage"
                  image={`/assets/background-0.png`}
                  description={
                    <>
                      <Typography>
                        DID opertions like create, update and deactivate.
                      </Typography>
                      <Typography>
                        Manage wallet portability needed to control your
                        identifiers.
                      </Typography>
                    </>
                  }
                  actions={
                    <>
                      <Button
                        size="small"
                        onClick={() => {
                          router.push('/wallet');
                        }}
                      >
                        Wallet
                      </Button>
                    </>
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <Card
                  title="Explore"
                  image={`/assets/background-1.png`}
                  description={
                    <>
                      <Typography>
                        Sidetree node activity including recent transactions and
                        operations.
                      </Typography>
                    </>
                  }
                  actions={
                    <>
                      <Button
                        size="small"
                        onClick={() => {
                          router.push('/history');
                        }}
                      >
                        History
                      </Button>
                    </>
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <Card
                  title="Resolve"
                  image={`/assets/background-2.png`}
                  description={
                    <>
                      <Typography>
                        Discover capabilities and services supported by a
                        decentralized identifier.
                      </Typography>
                    </>
                  }
                  actions={
                    <>
                      <Button
                        size="small"
                        onClick={() => {
                          router.push('/resolver');
                        }}
                      >
                        Resolve
                      </Button>
                    </>
                  }
                />
              </Grid>
            </Grid>
          </Box>
          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <DarkModeToggle />
          </div>
        </Theme>
      </main>
    </div>
  );
};

export default Home;
