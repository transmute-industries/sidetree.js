import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export default class SidetreeTransaction {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id?: string;

  @Column()
  transactionNumber!: number;

  @Column()
  transactionTime!: number;

  @Column()
  transactionTimeHash!: string;

  @Column()
  anchorString!: string;

  @Column()
  writer!: string;

  constructor(
    transactionNumber: number,
    transactionTime: number,
    transactionTimeHash: string,
    anchorString: string,
    writer: string
  ) {
    this.transactionNumber = transactionNumber;
    this.transactionTime = transactionTime;
    this.transactionTimeHash = transactionTimeHash;
    this.anchorString = anchorString;
    this.writer = writer;
  }
}
