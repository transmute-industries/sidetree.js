import PrivateKeyJwkEc from './PrivateKeyJwkEc';
import PrivateKeyJwkOkp from './PrivateKeyJwkOkp';

/**
 * Model for representing a private key in a JWK format.
 */
type PrivateKeyJwk = PrivateKeyJwkEc | PrivateKeyJwkOkp;

export default PrivateKeyJwk;
