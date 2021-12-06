// todo: make this a single config for the entire node dashboard
// including branding options, logos, etc.
export const config: any = {
  operator: process.env.NEXT_PUBLIC_OPERATOR,
  method:
    process.env.USE_ELEMENT !== 'true'
      ? process.env.NEXT_PUBLIC_SIDETREE_METHOD
      : process.env.NEXT_PUBLIC_ELEMENT_METHOD,
  description: process.env.NEXT_PUBLIC_DESCRIPTION,
  methodName: process.env.NEXT_PUBLIC_SIDETREE_METHOD,
  features: {
    title: 'Features',
    description: 'Decentralized Identifiers powered by Ethereum and IPFS.',
  },
  useSideTreeNodeConfigs: process.env.USE_ELEMENT !== 'true',
  sideTreeNodeConfigs: {
    batchingIntervalInSeconds: process.env.BATCH_INTERVAL_IN_SECONDS,
    observingIntervalInSeconds: process.env.OBSERVING_INTERVAL_IN_SECONDS,
    mongoDbConnectionString: process.env.MONGO_DB_CONNECTION_STRING,
    databaseName: process.env.SIDE_TREE_DATABASE_NAME,
    didMethodName: process.env.NEXT_PUBLIC_SIDETREE_METHOD,
    maxConcurrentDownloads: process.env.MAX_CONCURRENT_DOWNLOADS,
    port: process.env.SIDE_TREE_NODE_PORT,
  },
  elementNodeConfigs: {
    contentAddressableStoreServiceUri:
      process.env.ELEMENT_CONTENT_ADDRESSABLE_STORE_SERVICE_URI,
    databaseName: process.env.ELEMENT_DATABASE_NAME,
    didMethodName: process.env.NEXT_PUBLIC_ELEMENT_METHOD,
    ethereumRpcUrl: process.env.ETHEREUM_RCP_URL,
    mongoDbConnectionString: process.env.MONGO_DB_CONNECTION_STRING,
    batchingIntervalInSeconds: process.env.BATCH_INTERVAL_IN_SECONDS,
    observingIntervalInSeconds: process.env.OBSERVING_INTERVAL_IN_SECONDS,
    maxConcurrentDownloads: process.env.MAX_CONCURRENT_DOWNLOADS,
    versions: [
      {
        startingBlockchainTime: 0,
        version: 'latest',
      },
    ],
  },
};
