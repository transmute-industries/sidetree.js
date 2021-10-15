# @sidetree/qldb

This package contains an implementation of the Sidetree ledger interface on the QLDB ledger.

## Usage

```bash
npm install --save @sidetree/qldb
```

## QLDB FIPS Compliance

FIPS compliance for QLDB is unclear at this point mainly because we cannot know how AWS's internal crypto is used.

- QLDB uses a Merkle Tree with the SHA256 hash function to build its immutable ledger capabilities, which is part of FIPS's Secure Hash Standard. See [FIPS-180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).

- [AWS Documentation on QLDB compliance](https://docs.aws.amazon.com/qldb/latest/developerguide/qldb-compliance.html)

- "[Data in transit is encrypted using TLS](https://docs.aws.amazon.com/qldb/latest/developerguide/data-protection.html)". AWS uses two implementations of TLS.

Both have FIPS mode and non FIPS mode.
It's not clear which is used or whether FIPS mode is on for QLDB - OpenSSL: The open source standard implementation - s2n: Amazon's own lightweight implementation

- "[Data at rest is encrypted using AWS owned keys](https://docs.aws.amazon.com/qldb/latest/developerguide/data-protection.html)"
- QLDB is not in the list of services that have a [FIPS compliant endpoints](https://aws.amazon.com/compliance/fips/?nc1=h_ls)

## Testing for this Module

```bash
cd packages/ledger-qldb
npm run test
```

By default the test for this package will use a the MockQLDBLedger
implementation to replicate the functionality of QLDB on AWS.
To enable the AWS QLDBLedger module for testing the following two
actions are required.

1. Setup QLDB ledger
2. Enable the use of the S3Cas by editing the test file

**Instructions**

### 1. Setup QLDB ledger

- Create a new QLDB ledger: https://console.aws.amazon.com/qldb/home?region=us-east-1#first-run
- Set the same name used in `qldbLedger` in your config file
- Create an IAM User named `qldb-admin` with `Programmatic access`: https://console.aws.amazon.com/iam/home?region=us-east-1#/users
- Attach `AmazonQLDBFullAccess` policy to the user
- Write down the access key and the secret key and run the following commands locally:

```bash
aws configure set region us-east-1
aws configure set aws_access_key_id $AWS_ACCESS_KEY_ID
aws configure set aws_secret_access_key $AWS_SECRET_ACCESS_KEY
```

### 2. Enable the use of the S3Cas by editing the test file

To enable the `QLDBLedger` module for testing, the test file is located at `src/__tests__/QLDBLedger.test.ts`.
You must change the variable value of `forceMock` from `true` to `false`. An example
is shown below.

```typeScript
import { filesystem } from '@sidetree/test-vectors';
import AWS from 'aws-sdk/global';

import QLDBLedger from '../QLDBLedger';
import MockQLDBLedger from '../MockQLDBLedger';

jest.setTimeout(10 * 1000);

describe('QLDB tests', () => {
  const forceMock = false; // This Line

  const config = new AWS.Config();
  if (forceMock) {
    console.warn('Using mock QLDB interface for QLDB tests');
  } else if (!config.credentials) {
    console.warn(
      'No AWS credentials found in ~/.aws/credentials, using mock interace'
    );
  }
```

Note that you will need both the `~/.aws/credentials` file and `const forceMock = false;`.
The default QLDB Ledger name is `photon-test`. The value for this can be changed in
`src/__tests__/QLDBLedger.test.ts`.

```typeScript
  const ledger =
    config.credentials && !forceMock
      ? new QLDBLedger('photon-test', 'Test')
      : new MockQLDBLedger('Test');
```
