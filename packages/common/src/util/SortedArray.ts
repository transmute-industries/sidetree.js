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
 * Class containing reusable sorted array operations.
 */
export default class SortedArray {
  /**
   * Performs binary search on an item against the given sorted array using the given compare function.
   * @returns Returns the index of the item if found; `undefined` otherwise.
   */
  public static binarySearch<T1, T2>(
    sortedArray: Array<T1>,
    searchItem: T2,
    compare: (item1: T1, item2: T2) => number
  ): number | undefined {
    let lowerBoundaryIndex = 0;
    let upperBoundaryIndex = sortedArray.length - 1;
    let middleIndex = 0;
    while (lowerBoundaryIndex <= upperBoundaryIndex) {
      middleIndex = Math.floor((lowerBoundaryIndex + upperBoundaryIndex) / 2);

      const comparisonResult = compare(sortedArray[middleIndex], searchItem);
      if (comparisonResult > 0) {
        // If value pointed by middleIndex is greater than the searchItem:
        upperBoundaryIndex = middleIndex - 1;
      } else if (comparisonResult < 0) {
        // If value pointed by middleIndex is smaller than the searchItem:
        lowerBoundaryIndex = middleIndex + 1;
      } else {
        // Else we've found the item.
        return middleIndex;
      }
    }

    return undefined;
  }
}
