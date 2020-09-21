/**
 * Sidetree public key purpose.
 */
enum PublicKeyPurpose {
  Auth = 'auth',
  General = 'general',
  KeyAgreement = 'agreement',
  AssertionMethod = 'assertion',
  CapabilityDelegation = 'delegation',
  CapabilityInvocation = 'invocation',
}

export default PublicKeyPurpose;
