import { OperationGenerator, CreateOperation } from '@sidetree/core';
import { Config } from '@sidetree/common';
import * as fs from 'fs';
import {
  recoveryPublicKey,
  signingPublicKey,
  services,
  resolveBody,
} from '../fixtures';

const config: Config = require('../element-config.json');

const generateLongFormDidFixtures = async () => {
  const createOperationBuffer = await OperationGenerator.generateCreateOperationBuffer(
    recoveryPublicKey,
    signingPublicKey,
    services
  );
  const createOperation = await CreateOperation.parse(createOperationBuffer);
  const didMethodName = config.didMethodName;
  const didUniqueSuffix = createOperation.didUniqueSuffix;
  const shortFormDid = `did:${didMethodName}:${didUniqueSuffix}`;
  const encodedSuffixData = createOperation.encodedSuffixData;
  const encodedDelta = createOperation.encodedDelta;
  const longFormDid = `${shortFormDid}?-${didMethodName}-initial-state=${encodedSuffixData}.${encodedDelta}`;
  fs.writeFileSync(`${__dirname}/longFormDid.txt`, longFormDid);

  const longFormResolveBody = { ...resolveBody };
  (longFormResolveBody.didDocument['@context'][1] as any)[
    '@base'
  ] = longFormDid;
  longFormResolveBody.didDocument.id = longFormDid;
  fs.writeFileSync(
    `${__dirname}/longFormResolveBody.json`,
    JSON.stringify(longFormResolveBody, null, 2)
  );
};

(async () => {
  await generateLongFormDidFixtures();
})();
