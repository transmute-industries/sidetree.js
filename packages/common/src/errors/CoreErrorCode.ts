/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/main/reference-implementation-changes.md
 *
 * Copyright 2020 - Transmute Industries Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Error codes used by Sidetree core service.
 */
export default {
  BlockchainGetFeeResponseNotOk: 'blockchain_get_fee_response_not_ok',
  BlockchainGetLatestTimeResponseNotOk:
    'blockchain_get_latest_time_response_not_ok',
  BlockchainGetLockResponseNotOk: 'blockchain_get_lock_response_not_ok',
  BlockchainGetWriterLockResponseNotOk:
    'blockchain_get_writer_lock_response_not_ok',
  BlockchainReadInvalidArguments: 'blockchain_read_invalid_arguments',
  BlockchainReadResponseNotOk: 'blockchain_read_response_not_ok',
  BlockchainWriteResponseNotOk: 'blockchain_write_response_not_ok',
  VersionManagerBatchWriterNotFound: 'version_manager_batch_writer_not_found',
  VersionManagerDocumentComposerNotFound:
    'version_manager_document_composer_not_found',
  VersionManagerOperationProcessorNotFound:
    'version_manager_operation_processor_not_found',
  VersionManagerRequestHandlerNotFound:
    'version_manager_request_handler_not_found',
  VersionManagerTransactionProcessorNotFound:
    'version_manager_transaction_processor_not_found',
  VersionManagerTransactionSelectorNotFound:
    'version_manager_transaction_selector_not_found',
  VersionManagerVersionStringNotFound:
    'version_manager_version_string_not_found',
  VersionManagerVersionMetadataIncorrectType:
    'version_manager_version_metadata_incorrect_type',
};
