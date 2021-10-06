import type { NextPage } from "next";
import Head from "next/head";

import { useRouter } from "next/router";
import { AppPage } from "../../components/app-page";

import { Typography, Grid } from "@mui/material";

import { LatestTransactions } from "../../components/latest-transactions";
import { LatestTransactionsChart } from "../../components/latest-transactions-chart";

const TransactionHistory: NextPage = () => {
  const router = useRouter();

  const did = router.query.did as string;

  return (
    <div>
      <Head>
        <title>History</title>
        <meta name="description" content="Transaction history" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Typography gutterBottom>Recent Transactions</Typography>
              <LatestTransactionsChart />
            </Grid>
            <Grid item xs={12}>
              <LatestTransactions />
            </Grid>
          </Grid>
        </AppPage>
      </main>
    </div>
  );
};

export default TransactionHistory;
