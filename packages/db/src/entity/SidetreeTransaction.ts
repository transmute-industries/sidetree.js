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
