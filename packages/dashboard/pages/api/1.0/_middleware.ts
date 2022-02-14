import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';
import { config } from '../../../config';
import jwtVerifier from '../../../core/jwt/jwt-verifier';

// https://github.com/vercel/next.js/issues/31827 have to use canary version ATM
// based of off https://github.com/vercel/examples/blob/main/edge-functions/jwt-authentication/pages/api/_middleware.ts
export async function middleware(req: NextRequest, ev: NextFetchEvent) {
  if (req.page.name !== '/api/1.0/authenticate' && config.method === 'photon') {
    const verifyJwt = jwtVerifier({
      audience: config.auth.audience,
      issuerBaseURL: `https://${config.auth.domain}`,
    });
    try {
      const jwt = req.headers.get('authorization')!.split(' ')[1];
      await verifyJwt(jwt);
    } catch (err) {
      return new Response((err as any).message, { status: 401 });
    }
  }
  return NextResponse.next();
}
