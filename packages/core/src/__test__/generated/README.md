This folder is intentionally empty.

This folder can be filled with updated json files for:

```ts
const { sidetreeCoreGeneratedSecp256k1 } = require('@sidetree/test-vectors');
```

Set

```ts
process.env.WRITE_FIXTURES_TO_DISK = 'YES';
```

In `test-fixture-generation.test.ts` to do generate the files...

Then copy the generated files to `@sidetree/test-vectors`.

Any change to test vectors should be done with caution, they are critical to interoperability.
