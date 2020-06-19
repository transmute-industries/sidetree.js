import Web3 from 'web3';
import { AnchoredData } from '@sidetree/common';

export const logger = { log: () => jest.fn() };

export const getWeb3 = (provider: any = 'http://localhost:8545') => {
  return new Web3(provider);
};

export const web3 = getWeb3();
