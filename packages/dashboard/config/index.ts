// todo: make this a single config for the entire node dashboard
// including branding options, logos, etc.
export const config: any = {
  logoLight: process.env.NEXT_PUBLIC_LOGO_TEXT_LIGHT,
  logoDark: process.env.NEXT_PUBLIC_LOGO_TEXT_DARK,
  operator: process.env.NEXT_PUBLIC_OPERATOR,
  method: process.env.NEXT_PUBLIC_SIDETREE_METHOD,
  description: process.env.NEXT_PUBLIC_DESCRIPTION,
  batchingIntervalInSeconds: process.env.BATCH_INTERVAL_IN_SECONDS,
  observingIntervalInSeconds: process.env.OBSERVING_INTERVAL_IN_SECONDS,
  mongoDbConnectionString: process.env.MONGO_DB_CONNECTION_STRING,
  databaseName: process.env.DATABASE_NAME,
  maxConcurrentDownloads: process.env.MAX_CONCURRENT_DOWNLOADS,
  port: process.env.SIDE_TREE_NODE_PORT,
  contentAddressableStoreServiceUri:
    process.env.ELEMENT_CONTENT_ADDRESSABLE_STORE_SERVICE_URI,
  ethereumRpcUrl: process.env.ETHEREUM_RPC_URL,
  ethereumMnemonic: process.env.ETHEREUM_MNEMONIC,
  elementAnchorContract: process.env.ELEMENT_ANCHOR_CONTRACT,
};

export const nextAppConfigs = {
  logoLight: config.logoLight,
  logoDark: config.logoDark,
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
  ethereumRpcUrl: config.ethereumRpcUrl,
  ethereumMnemonic: config.ethereumMnemonic,
  elementAnchorContract: config.elementAnchorContract,
  databaseName: config.databaseName,
  mongoDbConnectionString: config.mongoDbConnectionString,
  didMethodName: config.method,
  batchingIntervalInSeconds: config.batchingIntervalInSeconds,
  observingIntervalInSeconds: config.observingIntervalInSeconds,
  maxConcurrentDownloads: config.maxConcurrentDownloads,
  versions: [
    {
      startingBlockchainTime: 0,
      version: 'latest',
    },
  ],
};

export const nodeConfiguration = config.method.startsWith('elem:')
  ? elementNodeConfigs
  : sideTreeNodeConfigs;
