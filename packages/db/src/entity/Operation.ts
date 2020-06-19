import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';
import { OperationType } from '@sidetree/common';

@Entity()
export default class Operation {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id?: string;

  @Column()
  didUniqueSuffix: string;

  @Column()
  type: OperationType;

  @Column()
  operationBuffer: Buffer;

  @Column()
  transactionTime: number;

  @Column()
  transactionNumber: number;

  @Column()
  operationIndex: number;

  constructor(
    didUniqueSuffix: string,
    type: OperationType,
    operationBuffer: Buffer,
    transactionTime: number,
    transactionNumber: number,
    operationIndex: number
  ) {
    this.didUniqueSuffix = didUniqueSuffix;
    this.type = type;
    this.operationBuffer = operationBuffer;
    this.transactionTime = transactionTime;
    this.transactionNumber = transactionNumber;
    this.operationIndex = operationIndex;
  }
}
