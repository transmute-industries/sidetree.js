/*
 * The code in this file originated from
 * @see https://github.com/decentralized-identity/sidetree
 * For the list of changes that was made to the original code
 * @see https://github.com/transmute-industries/sidetree.js/blob/master/reference-implementation-changes.md
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

import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export default class SidetreeTransaction {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id?: string;

  @Column()
  transaction_number!: number;

  @Column()
  transaction_time!: number;

  @Column()
  transaction_time_hash!: string;

  @Column()
  anchor_string!: string;

  @Column()
  writer!: string;

  constructor(
    transaction_number: number,
    transaction_time: number,
    transaction_time_hash: string,
    anchor_string: string,
    writer: string
  ) {
    this.transaction_number = transaction_number;
    this.transaction_time = transaction_time;
    this.transaction_time_hash = transaction_time_hash;
    this.anchor_string = anchor_string;
    this.writer = writer;
  }
}
