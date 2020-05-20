import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export class SidetreeTransaction {
  @ObjectIdColumn()
  _id?: string;

  @PrimaryColumn()
  transaction_number!: number;

  @Column()
  transaction_time!: number;

  @Column()
  transaction_time_hash!: string;

  @Column()
  anchor_string!: string;

  @Column()
  transaction_fee_paid!: number;

  @Column()
  normalized_transaction_fee!: number;

  @Column()
  writer!: string;

  constructor(
    transaction_number: number,
    transaction_time: number,
    transaction_time_hash: string,
    anchor_string: string,
    transaction_fee_paid: number,
    normalized_transaction_fee: number,
    writer: string
  ) {
    this.transaction_number = transaction_number;
    this.transaction_time = transaction_time;
    this.transaction_time_hash = transaction_time_hash;
    this.anchor_string = anchor_string;
    this.transaction_fee_paid = transaction_fee_paid;
    this.normalized_transaction_fee = normalized_transaction_fee;
    this.writer = writer;
  }
}
