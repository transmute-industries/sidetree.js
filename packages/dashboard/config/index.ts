// todo: make this a single config for the entire node dashboard
// including branding options, logos, etc.
export const config: any = {
  operator: process.env.NEXT_PUBLIC_OPERATOR,
  method:
    process.env.NEXT_PUBLIC_USE_ELEMENT !== 'true'
      ? process.env.NEXT_PUBLIC_SIDETREE_METHOD
      : process.env.NEXT_PUBLIC_ELEMENT_METHOD,
  description: process.env.NEXT_PUBLIC_DESCRIPTION,
  batchingIntervalInSeconds: process.env.BATCH_INTERVAL_IN_SECONDS,
  observingIntervalInSeconds: process.env.OBSERVING_INTERVAL_IN_SECONDS,
  mongoDbConnectionString: process.env.MONGO_DB_CONNECTION_STRING,
  databaseName: process.env.DATABASE_NAME,
  maxConcurrentDownloads: process.env.MAX_CONCURRENT_DOWNLOADS,
  port: process.env.SIDE_TREE_NODE_PORT,
  useSideTreeNodeConfigs: process.env.NEXT_PUBLIC_USE_ELEMENT !== 'true',
  contentAddressableStoreServiceUri:
    process.env.ELEMENT_CONTENT_ADDRESSABLE_STORE_SERVICE_URI,
  ethereumRpcUrl: process.env.ETHEREUM_RCP_URL,
};

export const nextAppConfigs = {
  operator: config.operator,
  method: config.method,
  description: config.description,
  features: {
    title: 'Features',
    description: 'Decentralized Identifiers powered by Ethereum and IPFS.',
  },
};

export const sideTreeNodeConfigs = {
  batchingIntervalInSeconds: config.batchingIntervalInSeconds,
  observingIntervalInSeconds: config.observingIntervalInSeconds,
  mongoDbConnectionString: config.mongoDbConnectionString,
  databaseName: config.databaseName,
  didMethodName: config.method,
  maxConcurrentDownloads: config.maxConcurrentDownloads,
  port: config.port,
};

export const elementNodeConfigs = {
  contentAddressableStoreServiceUri: config.contentAddressableStoreServiceUri,
  databaseName: config.databaseName,
  didMethodName: config.method,
  ethereumRpcUrl: config.ethereumRpcUrl,
  mongoDbConnectionString: config.mongoDbConnectionString,
  batchingIntervalInSeconds: config.batchingIntervalInSeconds,
  observingIntervalInSeconds: config.observingIntervalInSeconds,
  maxConcurrentDownloads: config.maxConcurrentDownloads,
};

export const nodeConfiguration =
  config.method === 'elem:ganache' ? elementNodeConfigs : sideTreeNodeConfigs;
