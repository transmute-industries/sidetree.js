import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export class SidetreeTransaction {
  @ObjectIdColumn()
  _id?: string;

  @PrimaryColumn()
  transactionNumber!: number;

  @Column()
  transactionHash!: string;

  @Column()
  transactionTime!: number;

  @Column()
  transactionTimeHash!: string;

  @Column()
  transactionTimestamp!: number;

  @Column()
  anchorFileHash!: string;

  constructor(
    transactionNumber: number,
    transactionHash: string,
    transactionTime: number,
    transactionTimeHash: string,
    transactionTimestamp: number,
    anchorFileHash: string
  ) {
    this.transactionNumber = transactionNumber;
    this.transactionHash = transactionHash;
    this.transactionTime = transactionTime;
    this.transactionTimeHash = transactionTimeHash;
    this.transactionTimestamp = transactionTimestamp;
    this.anchorFileHash = anchorFileHash;
  }
}
