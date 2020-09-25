# @sidetree/qldb

This package contains an implementation of the Sidetree ledger interface on the QLDB ledger. It passes the test suite defined in `@sidetree/ledger`.

Setup QLDB ledger

## Setup QLDB ledger

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

## Usage

```
npm install --save @sidetree/qldb
```

## Development

```
npm install
npm run test
```
