import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class SidetreeTransaction {
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
