import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Button, Box, LinearProgress, Typography, Paper } from '@mui/material';

import { AppPage } from '../../components/app-page';
import { dashboardWalletFactory } from '../../core/DashboardWallet';
import { FormEvent } from 'react-transition-group/node_modules/@types/react';

import { uiConfigs } from '../../config';
import { createDID } from '../../services/sidetree-node-client-api';

export async function getServerSideProps(context: any) {
  return {
    props: uiConfigs,
  };
}

const Create: NextPage<any> = ({
  logoLight,
  logoDark,
  method,
  description,
}) => {
  const router = useRouter();

  const [wallet, setWallet] = useState({} as any);
  const [isLoading, setIsLoading] = useState(false);

  const createDidFromWallet = async (wallet: any) => {
    const item = wallet.contents.find(
      (content: any) => content.type === 'Mnemonic'
    );
    const mnemonic = item.value;
    const hdparts = item.hdpath.split('/');
    const baseHdPath = hdparts.slice(0, hdparts.length - 1).join('/');
    const keyType = 'secp256k1';
    const key0 = await wallet.toKeyPair(mnemonic, keyType, `${baseHdPath}/0`);
    const key1 = await wallet.toKeyPair(mnemonic, keyType, `${baseHdPath}/1`);
    const key2 = await wallet.toKeyPair(mnemonic, keyType, `${baseHdPath}/2`);
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
    const didResolutionResponse = await createDID(createOperation, wallet); // no long form did information returned here...
    wallet.add({
      id: didResolutionResponse.didDocument.id,
      ...didResolutionResponse,
    });
    localStorage.setItem('sidetree.wallet', JSON.stringify(wallet));
    setWallet(wallet);
  };

  useEffect(() => {
    const walletStorage = localStorage.getItem('sidetree.wallet');
    if (!walletStorage) {
      router.push('/wallet', undefined, { shallow: true });
    } else {
      let newWallet = JSON.parse(walletStorage);
      newWallet = dashboardWalletFactory.build(newWallet);
      const resolutionResponse = newWallet.contents.find((item: any) => {
        return item.didDocument !== undefined;
      });
      // don't even allow a user to create again, if they already have a did in their wallet.
      if (resolutionResponse) {
        router.push('/update');
      }
      setWallet(newWallet);
    }
  }, [router]);

  const createDid = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await createDidFromWallet(wallet);
    setIsLoading(false);
  };

  const isCreated = () => {
    if (!wallet || !wallet.contents) {
      return false;
    }
    const lastResolution = wallet.contents.find((item: any) => {
      return item.didDocumentMetadata !== undefined;
    });
    if (lastResolution) {
      return true;
    }
  };

  const isPublished = () => {
    if (!wallet || !wallet.contents) {
      return false;
    }
    const lastResolution = wallet.contents.find((item: any) => {
      return item.didDocumentMetadata !== undefined;
    });
    if (!lastResolution) {
      return false;
    }
    return lastResolution.didDocumentMetadata.method.published;
  };

  return (
    <div>
      <Head>
        <title>{method} | Create</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage logoLight={logoLight} logoDark={logoDark}>
          {isLoading || (isCreated() && !isPublished() && <LinearProgress />)}

          <Paper>
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                maxWidth: '75%',
                margin: 'auto',
              }}
            >
              {!isCreated() ? (
                <>
                  <Typography variant={'h3'} gutterBottom>
                    Create Identifier
                  </Typography>
                  <Typography>{`You don't have an identifier yet.`}</Typography>
                  <Button
                    disabled={isLoading}
                    sx={{ m: 2 }}
                    color={'primary'}
                    variant={'contained'}
                    onClick={createDid}
                  >
                    Create Identifier
                  </Button>
                </>
              ) : (
                <>
                  {' '}
                  <Typography variant={'h3'} gutterBottom>
                    Publishing Identifier
                  </Typography>
                  <Typography>{`This can take a few minutes.`}</Typography>{' '}
                </>
              )}
            </Box>
          </Paper>
        </AppPage>
      </main>
    </div>
  );
};

export default Create;
