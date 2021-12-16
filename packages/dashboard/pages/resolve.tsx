import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { AppPage } from '../components/app-page';

import {
  Button,
  FormControl,
  Grid,
  Input,
  InputLabel,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';

import { FormEvent, useState } from 'react';

import { uiConfigs } from '../config';
export async function getServerSideProps(context: any) {
  return {
    props: uiConfigs,
  };
}

const Resolver: NextPage<any> = ({
  logoLight,
  logoDark,
  method,
  description,
}) => {
  const router = useRouter();
  const [did, setDid] = useState('');

  const resolveDid = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push('/' + did);
  };

  return (
    <div>
      <Head>
        <title>{method} | Resolve</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage logoLight={logoLight} logoDark={logoDark}>
          <Grid container spacing={2}>
            <Box sx={{ width: 1 }} m={2}>
              <form onSubmit={resolveDid}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="did">DID</InputLabel>
                  <Input
                    id="did"
                    placeholder="did:example:123"
                    value={did}
                    onChange={(e) => setDid(e.target.value)}
                  />
                </FormControl>
                <Box mt={1}>
                  <Button type="submit">Resolve</Button>
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
