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
import { uiConfigs } from '../config';
export async function getServerSideProps(context: any) {
  return {
    props: uiConfigs,
  };
}

const Home: NextPage<any> = ({
  logoLight,
  logoDark,
  method,
  description,
  features,
}) => {
  const router = useRouter();
  const textSize = { height: '80px' };

  return (
    <div>
      <Head>
        <title>{method} | Dashboard</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Theme>
          <CssBaseline />
          <ParticlesBlock>
            <div style={{ marginTop: '140px' }}>
              <Typography variant={'h2'} color={'primary'} gutterBottom>
                {method}
              </Typography>
              <Hidden smDown>
                <Typography variant={'h3'} style={{ marginBottom: '32px' }}>
                  {description}
                </Typography>
              </Hidden>
              <CompanyLogo
                sx={{ height: '48px' }}
                logoLight={logoLight}
                logoDark={logoDark}
              />
            </div>
          </ParticlesBlock>
          <Box>
            <SectionHeader
              title={features?.title}
              description={features?.description}
            />
            <Grid container sx={{ p: 2 }} spacing={2}>
              <Grid item xs={4}>
                <Card
                  title="Manage"
                  image={`/assets/background-0.png`}
                  description={
                    <div style={textSize}>
                      <Typography>DID opertions like create.</Typography>
                      <Typography>
                        Manage wallet portability needed to control your
                        identifiers.
                      </Typography>
                    </div>
                  }
                  actions={
                    <>
                      <Button
                        size="medium"
                        variant="outlined"
                        color="warning"
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
                    <div style={textSize}>
                      <Typography>
                        Sidetree node activity including recent transactions and
                        operations.
                      </Typography>
                    </div>
                  }
                  actions={
                    <>
                      <Button
                        size="medium"
                        variant="outlined"
                        color="warning"
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
                    <div style={textSize}>
                      <Typography>
                        Discover capabilities and services supported by a
                        decentralized identifier.
                      </Typography>
                    </div>
                  }
                  actions={
                    <>
                      <Button
                        size="medium"
                        variant="outlined"
                        color="warning"
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
