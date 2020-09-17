import { TransactionModel, AnchoredDataSerializer } from '@sidetree/common';
import multihashes from 'multihashes';
import Web3 from 'web3';

const getAccounts = (web3: Web3): Promise<Array<string>> =>
  new Promise((resolve, reject) => {
    web3.eth.getAccounts((err: any, accounts: any) => {
      if (err) {
        reject(err);
      }
      resolve(accounts);
    });
  });

const bytes32EnodedMultihashToBase58EncodedMultihash = (
  bytes32EncodedMultihash: string
) =>
  multihashes.toB58String(
    multihashes.fromHexString(
      `1220${bytes32EncodedMultihash.replace('0x', '')}`
    )
  );

const base58EncodedMultihashToBytes32 = (base58EncodedMultihash: string) => {
  return `0x${multihashes
    .toHexString(multihashes.fromB58String(base58EncodedMultihash))
    .substring(4)}`;
};

const eventLogToSidetreeTransaction = (log: any) => {
  const anchoredData = {
    anchorFileHash: bytes32EnodedMultihashToBase58EncodedMultihash(
      log.args.anchorFileHash
    ),
    numberOfOperations: Number.parseInt(log.args.numberOfOperations),
  };
  const anchorString = AnchoredDataSerializer.serialize(anchoredData);
  return {
    transactionNumber: log.args.transactionNumber.toNumber(),
    transactionTime: log.blockNumber,
    transactionTimeHash: log.blockHash,
    transactionHash: log.transactionHash,
    anchorString,
    writer: 'writer',
  };
};

const getBlock = async (
  web3: Web3,
  blockHashOrBlockNumber: any
): Promise<any> => {
  const block: any = await new Promise((resolve, reject) => {
    web3.eth.getBlock(blockHashOrBlockNumber, (err: any, b: any) => {
      if (err) {
        reject(err);
      }
      resolve(b);
    });
  });
  return block;
};

const extendSidetreeTransactionWithTimestamp = async (
  web3: Web3,
  txns: { transactionTime: number }[]
): Promise<TransactionModel[]> => {
  return Promise.all(txns.map(txn => getBlock(web3, txn.transactionTime)));
};

export default {
  base58EncodedMultihashToBytes32,
  bytes32EnodedMultihashToBase58EncodedMultihash,
  eventLogToSidetreeTransaction,
  extendSidetreeTransactionWithTimestamp,
  getAccounts,
  getBlock,
};
