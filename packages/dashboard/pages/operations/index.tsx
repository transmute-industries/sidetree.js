import type { NextPage } from "next";
import Head from "next/head";

import { useRouter } from "next/router";
import { AppPage } from "../../components/app-page";

import { Typography, Grid } from "@mui/material";

import { LatestOperations } from "../../components/latest-operations";

const OperationHistory: NextPage = () => {
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>History</title>
        <meta name="description" content="Transaction history" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage>
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
