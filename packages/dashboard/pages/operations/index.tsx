import type { NextPage } from 'next';
import Head from 'next/head';

import { useRouter } from 'next/router';
import { AppPage } from '../../components/app-page';

import { Typography, Grid } from '@mui/material';

import { LatestOperations } from '../../components/latest-operations';
import { uiConfigs } from '../../config';

export async function getServerSideProps(context: any) {
  return {
    props: uiConfigs,
  };
}

const OperationHistory: NextPage<any> = ({
  logoLight,
  logoDark,
  method,
  description,
}) => {
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>{method} | Operations</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage logoLight={logoLight} logoDark={logoDark}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography gutterBottom>Latest Operations</Typography>
              <LatestOperations />
            </Grid>
          </Grid>
        </AppPage>
      </main>
    </div>
  );
};

export default OperationHistory;
