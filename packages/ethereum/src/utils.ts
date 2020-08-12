import { TransactionModel, AnchoredDataSerializer } from '@sidetree/common';
import multihashes from 'multihashes';

const getAccounts = (web3: any): Promise<Array<string>> =>
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

const retryWithLatestTransactionCount = async (
  web3: any,
  method: any,
  args: any,
  options: any,
  maxRetries = 5
) => {
  let tryCount = 0;
  const errors = [];
  try {
    return await method(...args, {
      ...options,
    });
  } catch (e) {
    errors.push(`${e}`);
    tryCount += 1;
  }
  while (tryCount < maxRetries) {
    try {
      return method(...args, {
        ...options,
        nonce:
          // eslint-disable-next-line
          (await web3.eth.getTransactionCount(options.from, 'pending')) +
          tryCount -
          1,
      });
    } catch (e) {
      console.warn(e);
      errors.push(`${e}`);
      tryCount += 1;
    }
  }
  throw new Error(`
    Could not use method: ${method}.
    Most likely reason is invalid nonce.
    See https://ethereum.stackexchange.com/questions/2527

    This interface uses web3, and cannot be parallelized.
    Consider using a different HD Path for each node / service / instance.

    ${JSON.stringify(errors, null, 2)}
    `);
};

const getBlock = async (
  web3: any,
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

const getBlockchainTime = async (web3: any, blockHashOrBlockNumber: any) => {
  const block: any = await getBlock(web3, blockHashOrBlockNumber);
  if (block) {
    return block.timestamp;
  }
  return null;
};

const extendSidetreeTransactionWithTimestamp = async (
  web3: any,
  txns: any
): Promise<TransactionModel[]> => {
  return Promise.all(
    txns.map(async (txn: any) => {
      const timestamp = await getBlockchainTime(web3, txn.transactionTime);
      return {
        ...txn,
        transactionTimestamp: timestamp,
      };
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
  retryWithLatestTransactionCount,
};
