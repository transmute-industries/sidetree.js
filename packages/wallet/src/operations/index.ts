
import { create } from './create';
import { update } from './update';
import { recover } from './recover';
import { deactivate } from './deactivate';

export const operations = {
    create,
    update,
    recover,
    deactivate
};
export * from './createLongFormDid';
export * from './computeDidUniqueSuffix';
export * from './LocalSigner';
export * from './toMnemonic';
export * from './toKeyPair';

