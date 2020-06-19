import Web3 from 'web3';
import { AnchoredDataSerializer } from '@sidetree/common';

export const logger = console;

export const getWeb3 = (provider: any = 'http://localhost:8545') => {
  return new Web3(provider);
};

const anchorFileHash = 'QmNrEidQrAbxx3FzxNt9E6qjEDZrtvzxUVh47BXm55Zuen';
const anchorFileHash2 = 'QmVGtJ3tWYAotBwcwmRsdNqA9vtWZWkKCwxxLSwsBo3QFA';
const anchorFileHash3 = 'QmWYddCPs7uR9EvHNCZzpguVFVNfHc6aM3hPVzPdAEESMc';
const anchorFileHash4 = 'QmZck3ivjTFqJWqLagTGXjUTikSvkDsSxDLgvizKWKj5rz';

export const anchorString = AnchoredDataSerializer.serialize({
  anchorFileHash: anchorFileHash,
  numberOfOperations: 10,
});

export const anchorString2 = AnchoredDataSerializer.serialize({
  anchorFileHash: anchorFileHash2,
  numberOfOperations: 100,
});

export const anchorString3 = AnchoredDataSerializer.serialize({
  anchorFileHash: anchorFileHash3,
  numberOfOperations: 1000,
});

export const anchorString4 = AnchoredDataSerializer.serialize({
  anchorFileHash: anchorFileHash4,
  numberOfOperations: 10000,
});

export const web3 = getWeb3();
