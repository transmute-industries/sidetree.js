import PublicKeyJwkEc from './PublicKeyJwkEc';
import PublicKeyJwkOkp from './PublicKeyJwkOkp';

/**
 * Model for representing a public key in a JWK format.
 */
type PublicKeyJwk = PublicKeyJwkEc | PublicKeyJwkOkp;

export default PublicKeyJwk;
