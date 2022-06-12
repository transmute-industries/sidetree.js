import { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Button,
  Grid,
  Box,
  LinearProgress,
  Link,
  TextField,
  Stack,
} from '@mui/material';

import { AppPage } from '../components/app-page';
import { dashboardWalletFactory } from '../core/DashboardWallet';
import { FormEvent } from 'react-transition-group/node_modules/@types/react';

import { uiConfigs } from '../config';
import { createDID, resolve } from '../services/sidetree-node-client-api';

const createDidFromWallet = async (wallet: any) => {
  const mnemonic = wallet.contents.find(
    (content: any) => content.type === 'Mnemonic'
  ).value;
  const keyType = 'secp256k1';
  const key0 = await wallet.toKeyPair(mnemonic, keyType, "m/44'/1'/0'/0/0");
  const key1 = await wallet.toKeyPair(mnemonic, keyType, "m/44'/1'/0'/0/1");
  const key2 = await wallet.toKeyPair(mnemonic, keyType, "m/44'/1'/0'/0/2");
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
  const didResolutionResponse = await createDID(createOperation); // no long form did information returned here...
  wallet.add(didResolutionResponse);
  return wallet;
};

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

  const [wallet, setWallet] = useState({} as any);
  const [isLoading, setIsLoading] = useState(false);
  const [published, setPublished] = useState(false);
  const [shortFormDid, setShortFormDid] = useState(null);
  const [longFormDid, setLongFormDid] = useState(null);

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
    const updatedWallet = await createDidFromWallet(wallet);
    console.log(updatedWallet);
    // here we need to make sure the did is resolveable.
    // before  setting local storate wallet state.
    // localStorage.setItem('sidetree.wallet', JSON.stringify(wallet));
    setWallet(updatedWallet);
    setIsLoading(false);
  };

  useEffect(() => {
    if (wallet.contents) {
      const item = wallet.contents.find(
        (content: any) => content.didDocumentMetadata
      );
      if (item) {
        setPublished(item.didDocumentMetadata.method.published);
        setShortFormDid(item.didDocument.id);
      }
    }
  }, [wallet]);

  // const hasPublishedDid =
  //   wallet.contents &&
  //   wallet.contents.find((content: any) => content.didDocumentMetadata)!
  //     .didDocumentMetadata.method!.published;

  // console.log(hasPublishedDid);

  return (
    <div>
      <Head>
        <title>{method} | Create</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage logoLight={logoLight} logoDark={logoDark}>
          {isLoading && <LinearProgress />}
          <>
            <pre>
              {JSON.stringify({ published, did: shortFormDid }, null, 2)}
            </pre>
          </>

          <Stack>
            {!published && (
              <Button disabled={isLoading} onClick={createDid}>
                Create
              </Button>
            )}

            {shortFormDid && (
              <Button
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true);
                  const resolution = await resolve(shortFormDid);
                  console.log(resolution);
                  setIsLoading(false);
                }}
              >
                Resolve
              </Button>
            )}
          </Stack>
        </AppPage>
      </main>
    </div>
  );
};

export default Resolver;
