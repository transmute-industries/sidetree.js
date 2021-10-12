# @sidetree/cas-s3

This package contains an implementation of [Content Addressable Storage](https://en.wikipedia.org/wiki/Content-addressable_storage) used in Sidetree.

It contains:

- `S3Cas`: A CAS interface for AWS S3
- `MockS3Cas`: A Mock-CAS interface for AWS S3

## Usage

```
npm install --save @sidetree/cas-s3
```

## Development

```
git clone https://github.com/transmute-industries/sidetree.js.git && cd sidetree.js
npm install
```

## Testing for this Module

```
cd packages/cas-s3
npm run test
```

By default the test for this package will use a the MockS3Cas
implementation to replicate the functionality of S3 on AWS.
To enable the AWS S3Cas module for testing the following two
actions are required.

1. Create a `~/.aws/credentials` file
2. Enable the use of the S3Cas by editing the test file

**Instructions**

1. Create a `~/.aws/credentials` file

To create the `~/.aws/credentials` you will need to have the aws cli
tool, which can be installed from this repository: https://github.com/aws/aws-cli.

Once that is installed, run the `aws configure` command to create the file.

```
$ aws configure
AWS Access Key ID: MYACCESSKEY
AWS Secret Access Key: MYSECRETKEY
Default region name [us-west-2]: us-west-2
Default output format [None]: json
```

2. Enable the use of the S3Cas by editing the test file

To enable the `S3Cas` module for testing, the test file is located at `src/S3Cas.spec.ts`.
You must change the variable value of `forceMock` from `true` to `false`. An example
is shown below.

```
import { testSuite } from '@sidetree/cas';
import S3Cas from './S3Cas';
import MockS3Cas from './MockS3Cas';
import casConfig from './cas-config.json';
// import AWS object without services
import AWS from 'aws-sdk/global';

const forceMock = false; // This line

const config = new AWS.Config();
if (forceMock) {
  console.warn('Using mock s3 interface for S3 tests');
} else if (!config.credentials) {
  console.warn(
    'No AWS credentials found in ~/.aws/credentials, using mock interace'
  );
}

const cas =
  config.credentials && !forceMock
    ? new S3Cas(casConfig.s3BucketName)
    : new MockS3Cas();

testSuite(cas);
```

Note that you will need both the `~/.aws/credentials` file and `const forceMock = false;`
for the S3 module to run.

## Bucket Name

The default bucket name is `sidetree-cas-s3-test`. The value for this can be changed
in `src/cas-config.json`.

```
{
  "s3BucketName": "sidetree-cas-s3-test"
}
```
