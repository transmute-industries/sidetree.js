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
 * Class containing methods that operates against an array.
 */
export default class ArrayMethods {
  /**
   * Checkes to see if there are duplicates in the given array.
   */
  public static hasDuplicates<T>(array: Array<T>): boolean {
    const uniqueValues = new Set<T>();

    for (let i = 0; i < array.length; i++) {
      const value = array[i];
      if (uniqueValues.has(value)) {
        return true;
      }
      uniqueValues.add(value);
    }

    return false;
  }

  /**
   * Checks that entries in array 2 is not in array 1.
   */
  public static areMutuallyExclusive<T>(
    array1: Array<T>,
    array2: Array<T>
  ): boolean {
    const valuesInArray1 = new Set<T>(array1);

    for (const value of array2) {
      if (valuesInArray1.has(value)) {
        return false;
      }
    }

    return true;
  }
}
