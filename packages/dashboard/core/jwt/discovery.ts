import { strict as assert } from 'assert';

const OIDC_DISCOVERY = '/.well-known/openid-configuration';
const OAUTH2_DISCOVERY = '/.well-known/oauth-authorization-server';

export interface IssuerMetadata {
  issuer: string;
  jwks_uri: string;
  id_token_signing_alg_values_supported?: string[];
  [key: string]: unknown;
}

const assertIssuer = (data: IssuerMetadata) =>
  assert(data.issuer, `'issuer' not found in authorization server metadata`);

const discover = async (uri: string): Promise<IssuerMetadata> => {
  const url = new URL(uri);
  if (uri.includes('/.well-known/')) {
    const data: any = await fetch(uri);
    assertIssuer(data);
    return data;
  }

  const pathnames = [];
  if (url.pathname.endsWith('/')) {
    pathnames.push(`${url.pathname}${OIDC_DISCOVERY.substring(1)}`);
  } else {
    pathnames.push(`${url.pathname}${OIDC_DISCOVERY}`);
  }
  if (url.pathname === '/') {
    pathnames.push(`${OAUTH2_DISCOVERY}`);
  } else {
    pathnames.push(`${OAUTH2_DISCOVERY}${url.pathname}`);
  }

  for (const pathname of pathnames) {
    try {
      const wellKnownUri = uri + pathname;
      const res: any = await fetch(wellKnownUri);
      const data = await res.json();
      assertIssuer(data);
      return data;
    } catch (err) {
      // noop
    }
  }

  throw new Error('Failed to fetch authorization server metadata');
};

export default discover;
