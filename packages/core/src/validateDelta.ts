import DocumentComposer from './DocumentComposer';
import InputValidator from './InputValidator';

export const validateDelta = (delta: any) => {
  InputValidator.validateNonArrayObject(delta, 'delta');
  InputValidator.validateObjectContainsOnlyAllowedProperties(
    delta,
    ['patches', 'updateCommitment'],
    'delta'
  );

  // Validate `patches` property using the DocumentComposer.
  DocumentComposer.validateDocumentPatches(delta.patches);

  InputValidator.validateEncodedMultihash(
    delta.updateCommitment,
    'update commitment'
  );
};
