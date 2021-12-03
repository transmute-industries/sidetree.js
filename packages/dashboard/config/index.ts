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
  connectionString: process.env.CONNECTION_STRING,
  ethereumMnemonic: process.env.ETHEREUMMNEMONIC,
};

// When logged on the server, the non NEXT_PUBLIC_ variables values are readable.
// When logged on the client, they are not
console.log('CONFIG', config);
