
import { sign } from './sign';
import { verify } from './verify';

it("can sign and verify with JWS", async () =>{
    const privateKeyJwk = {
        "kty": "EC",
        "crv": "secp256k1",
        "x": "1F1NpCD4LpLFLyB331QEXRLetsYOaHN7UcVvoiFDIWE",
        "y": "qZbAP6LVUozDLE_-imodZtu780YYfJ4bX1w-mLGHLvo",
        "d": "Vh-iRjTZp4olbXxYibXNUq7ozeEhMQeF04HeFCKaKS0"
    };
    const header = {};
    const payload = { hello: 'world' };
    const compactJws = await sign(header, payload, privateKeyJwk)
    expect(compactJws).toBe('eyJhbGciOiJFUzI1NksifQ.eyJoZWxsbyI6IndvcmxkIn0.Scf569hgWxDqpJG_0XmHsF-Dt_SZET0kz4z3OHf44g4Pyi1q8QP0KdVfInWBJ-9efQRihnEJZ50RaLzztlCbrQ')
    const verified = await verify(compactJws, privateKeyJwk);
    expect(verified).toBe(true);
})