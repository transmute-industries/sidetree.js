import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Button, Grid, Box, CircularProgress, Link } from '@mui/material';

import { AppPage } from '../components/app-page';
import { dashboardWalletFactory } from '../core/DashboardWallet';
import { FormEvent } from 'react-transition-group/node_modules/@types/react';

export async function getServerSideProps(context: any) {
  const res = await fetch(`http://${context.req.headers.host}/api/1.0`);
  const data = await res.json();
  return {
    props: data,
  };
}

const Resolver: NextPage<any> = ({ logoLight, logoDark }) => {
  const router = useRouter();

  const [wallet, setWallet] = useState({} as any);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const walletStorage = localStorage.getItem('sidetree.wallet');
    if (!walletStorage) {
      router.push('/wallet', undefined, { shallow: true });
    } else {
      let newWallet = JSON.parse(walletStorage);
      newWallet = dashboardWalletFactory.build(newWallet);
      setWallet(newWallet);
    }
  }, [router]);

  const createDid = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const mnemonic = wallet.contents.find(
      (content: any) => content.type === 'Mnemonic'
    ).value;
    const keyType = 'secp256k1';
    const key0 = await wallet.toKeyPair(mnemonic.value, 0, keyType);
    const key1 = await wallet.toKeyPair(mnemonic.value, 1, keyType);
    const key2 = await wallet.toKeyPair(mnemonic.value, 2, keyType);
    const document: any = {
      publicKeys: [
        {
          id: key0.id.split('#').pop(),
          type: key0.type,
          publicKeyJwk: key0.publicKeyJwk,
          purposes: ['authentication', 'assertionMethod', 'keyAgreement'],
        },
      ],
    };
    const recoveryKey = key1.publicKeyJwk;
    const updateKey = key2.publicKeyJwk;
    const input1 = { recoveryKey, updateKey, document };
    const createOperation = await wallet.operations.create(input1);
    const response = await fetch('/api/1.0/operations', {
      method: 'POST',
      body: JSON.stringify(createOperation),
    });
    const didResolution = await response.json();
    wallet.add(didResolution);
    localStorage.setItem('sidetree.wallet', JSON.stringify(wallet));
    setIsLoading(false);
  };

  return (
    <div>
      <Head>
        <title>Create</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage logoLight={logoLight} logoDark={logoDark}>
          <Grid container spacing={2}>
            {wallet.contents &&
              !wallet.contents.find((content: any) => content.didDocument) && (
                <Box sx={{ width: 1 }} m={2}>
                  <form onSubmit={createDid}>
                    <Box mt={1}>
                      <Button type="submit" disabled={isLoading}>
                        Create DID
                      </Button>
                    </Box>
                  </form>
                </Box>
              )}
            {wallet.contents &&
              wallet.contents.find((content: any) => content.didDocument) && (
                <Box sx={{ width: 1 }} m={2}>
                  <p>
                    You have did{' '}
                    <Link
                      href={`/${
                        wallet.contents.find(
                          (content: any) => content.didDocument
                        ).didDocument.id
                      }`}
                    >
                      {
                        wallet.contents.find(
                          (content: any) => content.didDocument
                        ).didDocument.id
                      }
                    </Link>
                  </p>
                </Box>
              )}
            {isLoading && (
              <Box sx={{ width: 1 }} m={2}>
                <CircularProgress />
              </Box>
            )}
          </Grid>
        </AppPage>
      </main>
    </div>
  );
};

export default Resolver;
