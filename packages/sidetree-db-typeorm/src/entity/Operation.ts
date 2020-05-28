import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export class Operation {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id?: string;

  @Column()
  didUniqueSuffix: string;

  @Column()
  type: string;

  @Column()
  operationBuffer: Buffer;

  constructor(didUniqueSuffix: string, type: string, operationBuffer: Buffer) {
    this.didUniqueSuffix = didUniqueSuffix;
    this.type = type;
    this.operationBuffer = operationBuffer;
  }
}
