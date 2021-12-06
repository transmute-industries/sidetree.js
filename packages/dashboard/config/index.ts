// todo: make this a single config for the entire node dashboard
// including branding options, logos, etc.
export const config: any = {
  operator: process.env.NEXT_PUBLIC_OPERATOR,
  method: process.env.NEXT_PUBLIC_METHOD,
  description: process.env.NEXT_PUBLIC_DESCRIPTION,
  methodName: process.env.NEXT_PUBLIC_SIDETREE_METHOD,
  features: {
    title: 'Features',
    description: 'Decentralized Identifiers powered by Ethereum and IPFS.',
  },
  sideTreeNodeConfigs: {
    batchingIntervalInSeconds: process.env.BATCH_INTERVAL_IN_SECONDS,
    observingIntervalInSeconds: process.env.OBSERVING_INTERVAL_IN_SECONDS,
    mongoDbConnectionString: process.env.MONGO_DB_CONNECTION_STRING,
    databaseName: process.env.DATABASE_NAME,
    didMethodName: process.env.NEXT_PUBLIC_SIDETREE_METHOD,
    maxConcurrentDownloads: process.env.MAX_CONCURRENT_DOWNLOADS,
    port: process.env.SIDE_TREE_NODE_PORT,
  },
};
