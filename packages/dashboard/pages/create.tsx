import type { NextPage } from 'next';
import Head from 'next/head';
import { Button, Grid, Box } from '@mui/material';

import { AppPage } from '../components/app-page';

const Resolver: NextPage = () => {
  return (
    <div>
      <Head>
        <title>Create</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage>
          <Grid container spacing={2}>
            <Box sx={{ width: 1 }} m={2}>
              <form>
                <Box mt={1}>
                  <Button type="submit" disabled>
                    Create
                  </Button>
                </Box>
              </form>
            </Box>
          </Grid>
        </AppPage>
      </main>
    </div>
  );
};

export default Resolver;
