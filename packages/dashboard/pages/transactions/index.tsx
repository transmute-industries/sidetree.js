import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import { AppPage } from '../../components/app-page';

import { Grid } from '@mui/material';
import { LatestTransactions } from '../../components/latest-transactions';
import { getTransactions } from '../../services/sidetree-node-client-api';
import { uiConfigs } from '../../config';

export async function getServerSideProps(context: any) {
  return {
    props: uiConfigs,
  };
}

const TransactionHistory: NextPage<any> = ({ logoLight, logoDark }) => {
  const [transactions, setTransactions] = useState(null);

  useEffect(() => {
    async function loadPageData() {
      const { transactions } = await getTransactions();
      setTransactions(transactions);
    }
    loadPageData();
  }, [setTransactions]);

  return (
    <div>
      <Head>
        <title>Transactions</title>
        <meta name="description" content="Transaction history" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage logoLight={logoLight} logoDark={logoDark}>
          {transactions === null ? (
            <>loading...</>
          ) : (
            <Grid container spacing={1}>
              {/* Chart hidden for now. */}
              {/* <Grid item xs={12}>
                <Typography gutterBottom>Recent Transactions</Typography>
                <LatestTransactionsChart />
              </Grid> */}
              <Grid item xs={12}>
                <LatestTransactions transactions={transactions} />
              </Grid>
            </Grid>
          )}
        </AppPage>
      </main>
    </div>
  );
};

export default TransactionHistory;
