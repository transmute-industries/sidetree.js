import Web3 from 'web3';

export const getWeb3 = (provider = 'http://localhost:8545'): Web3 => {
  return new Web3(provider);
};

export const web3 = getWeb3();
