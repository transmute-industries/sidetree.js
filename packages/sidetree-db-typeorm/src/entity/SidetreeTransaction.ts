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
}
