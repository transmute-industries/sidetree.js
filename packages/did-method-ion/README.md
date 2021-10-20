## Installing Ion on a Raspberry Pi 4 

See [instructions](https://github.com/transmute-industries/sidetree.js/blob/main/packages/did-method-ion/INSTALL.md)

### Creating an ION DID

See [instructions](https://github.com/decentralized-identity/ion/blob/master/cli.md)

```
❯ ion operation create 
DID: did:ion:EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA

Recovery private key saved as: EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA-RecoveryPrivateKey.json
Update private key saved as: EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA-UpdatePrivateKey.json
Signing private key saved as: EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA-SigningPrivateKey.json

Create request body:
{
  "type": "create",
  "suffixData": {
    "deltaHash": "EiC1LGfh47ZBXjFRXELtonJ8pCbg6c9BbtHXAgA25vPSTg",
    "recoveryCommitment": "EiC3M_2dIVUBou36U9fKTBN6Mz9xA2xxRR1gsHkC0789Sw"
  },
  "delta": {
    "updateCommitment": "EiAOZiRrOJmqZS1j30UXUPGMwWuzriB4FMBMWBT82mm5Cw",
    "patches": [
      {
        "action": "replace",
        "document": {
          "publicKeys": [
            {
              "id": "signing-key",
              "type": "EcdsaSecp256k1VerificationKey2019",
              "publicKeyJwk": {
                "kty": "EC",
                "crv": "secp256k1",
                "x": "qp0Ezzc4YhA196COYKa-RHrCom-0LgFtAf8FqvcntN0",
                "y": "zWcbbbg9w1m-DNOszvM68TD0_vFBtWyc18S06c8cULU"
              }
            }
          ]
        }
      }
    ]
  }
}

Long-form DID:
did:ion:EiBgMkQDrUjGYkUZqQgTiOkZeyQiQgNuYZLiW1S9M-oDCA:eyJkZWx0YSI6eyJwYXRjaGVzIjpbeyJhY3Rpb24iOiJyZXBsYWNlIiwiZG9jdW1lbnQiOnsicHVibGljS2V5cyI6W3siaWQiOiJzaWduaW5nLWtleSIsInB1YmxpY0tleUp3ayI6eyJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsIngiOiJxcDBFenpjNFloQTE5NkNPWUthLVJIckNvbS0wTGdGdEFmOEZxdmNudE4wIiwieSI6InpXY2JiYmc5dzFtLUROT3N6dk02OFREMF92RkJ0V3ljMThTMDZjOGNVTFUifSwidHlwZSI6IkVjZHNhU2VjcDI1NmsxVmVyaWZpY2F0aW9uS2V5MjAxOSJ9XX19XSwidXBkYXRlQ29tbWl0bWVudCI6IkVpQU9aaVJyT0ptcVpTMWozMFVYVVBHTXdXdXpyaUI0Rk1CTVdCVDgybW01Q3cifSwic3VmZml4RGF0YSI6eyJkZWx0YUhhc2giOiJFaUMxTEdmaDQ3WkJYakZSWEVMdG9uSjhwQ2JnNmM5QmJ0SFhBZ0EyNXZQU1RnIiwicmVjb3ZlcnlDb21taXRtZW50IjoiRWlDM01fMmRJVlVCb3UzNlU5ZktUQk42TXo5eEEyeHhSUjFnc0hrQzA3ODlTdyJ9fQ

DID suffix data:
{
  "deltaHash": "EiC1LGfh47ZBXjFRXELtonJ8pCbg6c9BbtHXAgA25vPSTg",
  "recoveryCommitment": "EiC3M_2dIVUBou36U9fKTBN6Mz9xA2xxRR1gsHkC0789Sw"
}

Document delta:
{
  "updateCommitment": "EiAOZiRrOJmqZS1j30UXUPGMwWuzriB4FMBMWBT82mm5Cw",
  "patches": [
    {
      "action": "replace",
      "document": {
        "publicKeys": [
          {
            "id": "signing-key",
            "type": "EcdsaSecp256k1VerificationKey2019",
            "publicKeyJwk": {
              "kty": "EC",
              "crv": "secp256k1",
              "x": "qp0Ezzc4YhA196COYKa-RHrCom-0LgFtAf8FqvcntN0",
              "y": "zWcbbbg9w1m-DNOszvM68TD0_vFBtWyc18S06c8cULU"
            }
          }
        ]
      }
    }
  ]
}
```
