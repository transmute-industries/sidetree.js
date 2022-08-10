import React from 'react';
import { useEffect, useState } from 'react';

import type { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AppPage } from '../../components/app-page';

import {
  Typography,
  Grid,
  Paper,
  Button,
  Box,
  TextField,
  LinearProgress,
} from '@mui/material';

import { WalletCard } from '../../components/wallet-card';

import { getWallet } from '../../core/facade';
import { uiConfigs } from '../../config';

import { RecentOperations } from '../../components/recent-operations';
import { DidDocument } from '../../components/did-document';

import {
  resolve,
  getOperations,
} from '../../services/sidetree-node-client-api';

import IdentifierTabs from './identifier-tabs';

export async function getServerSideProps(context: any) {
  return {
    props: uiConfigs,
  };
}

const Update: NextPage<any> = ({
  description,
  method,
  logoLight,
  logoDark,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading]: any = useState(true);
  const [wallet, setWallet]: any = useState(null);

  const [didDocument, setDidDocument] = useState();
  const [didDocumentOperations, setDidDocumentOperations] = useState([]);

  React.useEffect(() => {
    const w = getWallet();
    if (w === null) {
      router.push('/wallet');
    }
    if (wallet === null && w !== null) {
      setWallet(w);
      const resolutionResponse = w.contents.find((item) => {
        return item.didDocument !== undefined;
      });
      if (!resolutionResponse) {
        router.push('/create');
      } else {
        setDidDocument(resolutionResponse.didDocument);
      }
      setTimeout(() => {
        setIsLoading(false);
      }, 1 * 1000);
    }
  }, [wallet, setWallet, router]);

  const handleRefresh = async () => {
    setIsLoading(true);

    const oldResolution = wallet.contents.find((item: any) => {
      return item.didDocument !== undefined;
    });
    const didResolutionResponse = await resolve(oldResolution.didDocument.id);

    wallet.remove(didResolutionResponse.didDocument.id);

    wallet.add({
      id: didResolutionResponse.didDocument.id,
      ...didResolutionResponse,
    });

    setWallet(wallet);

    const { operations } = await getOperations(oldResolution.didDocument.id);
    setDidDocumentOperations(operations);

    setTimeout(() => {
      setIsLoading(false);
    }, 2 * 1000);
  };

  return (
    <div>
      <Head>
        <title>{method} | Update</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <AppPage logoLight={logoLight} logoDark={logoDark} method={method}>
          {isLoading ? (
            <>
              <LinearProgress />
            </>
          ) : (
            <>
              {wallet && (
                <IdentifierTabs
                  didDocument={
                    <DidDocument
                      refresh={handleRefresh}
                      didDocument={didDocument}
                      operationCount={didDocumentOperations.length}
                    />
                  }
                  wallet={<WalletCard wallet={wallet} />}
                  operations={
                    <RecentOperations operations={didDocumentOperations} />
                  }
                />
              )}
            </>
          )}
        </AppPage>
      </main>
    </div>
  );
};

export default Update;
