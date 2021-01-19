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

import { ICas } from '@sidetree/common';
import DownloadManager from '../DownloadManager';
import { MockCas } from '@sidetree/cas';
import timeSpan from 'time-span';

describe('DownloadManager', () => {
  const maxConcurrentDownloads = 3;
  const mockSecondsTakenForEachCasFetch = 2;

  let cas: ICas;
  let downloadManager: DownloadManager;

  const originalDefaultTestTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

  beforeAll(() => {
    jest.setTimeout(20000); // These asynchronous tests can take a bit longer than normal.

    cas = new MockCas(mockSecondsTakenForEachCasFetch);
    downloadManager = new DownloadManager(maxConcurrentDownloads, cas);
    downloadManager.start();
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalDefaultTestTimeout;
  });

  it('should queue up downloads if max concurrent download count is exceeded.', async () => {
    // Write some content in CAS.
    const content1 = await cas.write(Buffer.from('1'));
    const content2 = await cas.write(Buffer.from('2'));
    const content3 = await cas.write(Buffer.from('3'));
    const content4 = await cas.write(Buffer.from('4'));

    // Start timer to measure total time taken for the 4 downloads.
    const endTimer = timeSpan();

    // Queue 4 downloads.
    const maxContentSizeInBytes = 20000000;
    void downloadManager.download(content1, maxContentSizeInBytes);
    void downloadManager.download(content2, maxContentSizeInBytes);
    void downloadManager.download(content3, maxContentSizeInBytes);
    await downloadManager.download(content4, maxContentSizeInBytes);

    // Since there is only 3 concurrent download lanes,
    // the 4th download would have to wait thus download time would be at least twice the time as the mock download time.
    const totalDownloadTimeInMs = endTimer.rounded();
    const minimalTimeTakenInMs = mockSecondsTakenForEachCasFetch * 2 * 1000;
    expect(totalDownloadTimeInMs).toBeGreaterThanOrEqual(minimalTimeTakenInMs);
  });
});
