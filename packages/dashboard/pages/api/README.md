## Sidetree API

There are 2 primary sidetree node instances that must be exposed over http.

### handleOpertionRequest

```ts
const operation = { ... };
const { status, body } = await sidetree.handleOperationRequest(operation);
// status => http status code
// body => http response body
```

### handleResolveRequest

```ts
const did = 'did:example:123';
const { status, body } = await sidetree.handleResolveRequest(did);
// status => http status code
// body => http response body
```
