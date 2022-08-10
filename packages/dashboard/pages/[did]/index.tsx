import type { NextPage } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';

import { useRouter } from 'next/router';

import { AppPage } from '../../components/app-page';

import { RecentOperations } from '../../components/recent-operations';
import { DidDocument } from '../../components/did-document';

import { Grid } from '@mui/material';

import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import {
  resolve,
  getOperations,
} from '../../services/sidetree-node-client-api';
import { uiConfigs } from '../../config';

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

  const did = router.query.did as string;

  const [didDocument, setDidDocument] = useState();
  const [isLoading, setIsLoading] = useState(true);

  const [didDocumentOperations, setDidDocumentOperations] = useState([]);

  useEffect(() => {
    async function loadPageData() {
      if (did !== undefined) {
        const res: any = await resolve(did);
        if (res.code === 'did_not_found') {
          setIsLoading(false);
        } else {
          // FIXME: throwing 500
          // const res2: any = await getOperations(did);
          setDidDocument(res.didDocument);
          // setDidDocumentOperations(res2.operations);
          setIsLoading(false);
        }
      }
    }
    loadPageData();
  }, [did, setDidDocument, setIsLoading]);

  return (
    <div>
      <Head>
        <title>{method} | Resolve</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage logoLight={logoLight} logoDark={logoDark}>
          {isLoading && (
            <Box display="flex" justifyContent="center" sx={{ width: 1 }}>
              <CircularProgress />
            </Box>
          )}
          {!isLoading && (
            <>
              {didDocument ? (
                <>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <DidDocument
                        didDocument={didDocument}
                        operationCount={didDocumentOperations.length}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <RecentOperations operations={didDocumentOperations} />
                    </Grid>
                  </Grid>
                </>
              ) : (
                <>
                  <Paper sx={{ p: 4 }}>
                    <Typography variant={'h4'} sx={{ mb: 2 }}>
                      DID Not Found
                    </Typography>
                    <Typography variant={'h5'} sx={{ mb: 2 }}>
                      There are a few reasons this might be the case.
                    </Typography>

                    <Typography variant={'body1'}>
                      1. The DID Creation Operation was never anchored to the
                      ledger or storage properly.
                      <br />
                      2. The DID Creation Operation was malformed and rejected
                      by the DID Resolution process.
                      <br />
                      3. The storage content for the operation is no longer
                      retrievable from the storage network.
                      <br />
                      4. The ledger record is no longer retrievable from the
                      ledger network.
                      <br />
                    </Typography>

                    <Typography variant={'body1'}>
                      If you are the controller for this identifier, please try
                      create it again.
                    </Typography>

                    <Button
                      variant={'outlined'}
                      sx={{ mt: 2 }}
                      onClick={() => {
                        router.push('/create');
                      }}
                    >
                      Retry Create Operation
                    </Button>
                  </Paper>
                </>
              )}
            </>
          )}
        </AppPage>
      </main>
    </div>
  );
};

export default Resolver;
