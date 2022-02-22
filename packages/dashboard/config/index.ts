// todo: make this a single config for the entire node dashboard
// including branding options, logos, etc.
export const config: any = {
  logoLight: '/assets/logo-with-text.white.svg',
  logoDark: '/assets/logo-with-text.purple.svg',
  operator: 'Transmute',
  method: process.env.SIDETREE_METHOD,
  description: process.env.DESCRIPTION,
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
  ethereumPrivateKey: process.env.ETHEREUM_PRIVATE_KEY,
  elementAnchorContract: process.env.ELEMENT_ANCHOR_CONTRACT,
  awsCredentials: {
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  qldbLedger: process.env.QLDB_LEDGER,
  qldbLedgerTable: process.env.QLDB_LEDGER_TABLE,
  s3BucketName: process.env.S3_BUCKET_NAME,
  auth: {
    audience: process.env.AUTH_AUDIENCE,
    domain: process.env.AUTH_DOMAIN,
  },
};

export const uiConfigs = {
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
  databaseName: config.databaseName,
  didMethodName: config.method,
  ethereumRpcUrl: config.ethereumRpcUrl,
  mongoDbConnectionString: config.mongoDbConnectionString,
  observingIntervalInSeconds: config.observingIntervalInSeconds,
  maxConcurrentDownloads: config.maxConcurrentDownloads,
  batchingIntervalInSeconds: config.batchingIntervalInSeconds,
  versions: [
    {
      startingBlockchainTime: 0,
      version: 'latest',
    },
  ],
  elementAnchorContract: config.elementAnchorContract,
  ethereumMnemonic: config.ethereumMnemonic,
  ethereumPrivateKey: config.ethereumPrivateKey,
};

export const photonNodeConfigs = {
  awsCredentials: config.awsCredentials,
  qldbLedger: config.qldbLedger,
  qldbLedgerTable: config.qldbLedgerTable,
  s3BucketName: config.s3BucketName,
  databaseName: config.databaseName,
  didMethodName: config.method,
  mongoDbConnectionString: config.mongoDbConnectionString,
  observingIntervalInSeconds: +config.observingIntervalInSeconds,
  maxConcurrentDownloads: +config.maxConcurrentDownloads,
  batchingIntervalInSeconds: +config.batchingIntervalInSeconds,
  versions: [
    {
      startingBlockchainTime: 0,
      version: 'latest',
    },
  ],
};

let nodeConfiguration: any = sideTreeNodeConfigs;
if (config.method && config.method.startsWith('elem')) {
  nodeConfiguration = elementNodeConfigs;
} else if (config.method && config.method.startsWith('photon')) {
  nodeConfiguration = photonNodeConfigs;
}
export { nodeConfiguration };
