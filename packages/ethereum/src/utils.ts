import { TransactionModel, AnchoredDataSerializer } from '@sidetree/common';
import multihashes from 'multihashes';
import Web3 from 'web3';
import { BlockTransactionString } from 'web3-eth';
import { EventData } from 'web3-eth-contract';
import BN from 'bn.js';

const getAccounts = (web3: Web3): Promise<Array<string>> =>
  new Promise((resolve, reject) => {
    web3.eth.getAccounts((err: Error, accounts: string[]) => {
      if (err) {
        reject(err);
      }
      resolve(accounts);
    });
  });

const bytes32EnodedMultihashToBase58EncodedMultihash = (
  bytes32EncodedMultihash: string
): string =>
  multihashes.toB58String(
    multihashes.fromHexString(
      `1220${bytes32EncodedMultihash.replace('0x', '')}`
    )
  );

const base58EncodedMultihashToBytes32 = (
  base58EncodedMultihash: string
): string => {
  return `0x${multihashes
    .toHexString(multihashes.fromB58String(base58EncodedMultihash))
    .substring(4)}`;
};

interface ElementEventData extends EventData {
  args: {
    anchorFileHash: string;
    numberOfOperations: string;
    transactionNumber: BN;
  };
}
const eventLogToSidetreeTransaction = (
  log: ElementEventData
): TransactionModel => {
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
    anchorString,
    transactionFeePaid: 0,
    normalizedTransactionFee: 0,
    writer: 'writer',
  };
};

const getBlock = async (
  web3: Web3,
  blockHashOrBlockNumber: string | number
): Promise<BlockTransactionString> => {
  const block: BlockTransactionString = await new Promise((resolve, reject) => {
    web3.eth.getBlock(
      blockHashOrBlockNumber,
      (err: Error, b: BlockTransactionString) => {
        if (err) {
          reject(err);
        }
        resolve(b);
      }
    );
  });
  return block;
};

const getBlockchainTime = async (
  web3: Web3,
  blockHashOrBlockNumber: string | number
): Promise<string | number | null> => {
  const block: BlockTransactionString = await getBlock(
    web3,
    blockHashOrBlockNumber
  );
  if (block) {
    return block.timestamp;
  }
  return null;
};

const extendSidetreeTransactionWithTimestamp = async (
  web3: Web3,
  txns: TransactionModel[]
): Promise<TransactionModel[]> => {
  return Promise.all(
    txns.map(async txn => {
      const timestamp = await getBlockchainTime(web3, txn.transactionTime);
      if (typeof timestamp === 'number') {
        return {
          ...txn,
          transactionTimestamp: timestamp,
        };
      }
      return txn;
    })
  );
};

export default {
  base58EncodedMultihashToBytes32,
  bytes32EnodedMultihashToBase58EncodedMultihash,
  eventLogToSidetreeTransaction,
  extendSidetreeTransactionWithTimestamp,
  getAccounts,
  getBlock,
  getBlockchainTime,
};
