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

const Resolver: NextPage = () => {
  const router = useRouter();
  const [did, setDid] = useState('');
  const [didDocument, setDidDocument] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const resolveDid = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch(`/api/did/${did}`);
    const data = await res.json();
    setDidDocument(data);
    setIsLoading(false);
  };

  return (
    <div>
      <Head>
        <title>Resolve</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage>
          <Grid container spacing={2}>
            <Box sx={{ width: 1 }} m={2}>
              <form onSubmit={resolveDid}>
                <FormControl fullWidth>
                  <InputLabel htmlFor="did">DID</InputLabel>
                  <Input
                    id="did"
                    placeholder="did:elem:ropsten:123"
                    value={did}
                    onChange={(e) => setDid(e.target.value)}
                  />
                </FormControl>
                <Box mt={1}>
                  <Button type="submit">Resolve</Button>
                </Box>
              </form>
            </Box>
            {isLoading && (
              <Box display="flex" justifyContent="center" sx={{ width: 1 }}>
                <CircularProgress />
              </Box>
            )}
            {!isLoading && (
              <Typography>{JSON.stringify(didDocument)}</Typography>
            )}
          </Grid>
        </AppPage>
      </main>
    </div>
  );
};

export default Resolver;
