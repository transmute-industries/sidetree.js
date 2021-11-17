/* eslint-disable @next/next/no-sync-scripts */
import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';

export async function getServerSideProps(context: any) {
  return {
    props: {}, // will be passed to the page component as props
  };
}

const ApidDocs: NextPage = (props: any) => {
  const title = 'API';
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" href="/favicon.ico" />
        <script
          type="module"
          src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"
        ></script>
      </Head>
      <>
        <rapi-doc spec-url="/spec/openapi.yml"></rapi-doc>
      </>
    </>
  );
};

export default ApidDocs;
