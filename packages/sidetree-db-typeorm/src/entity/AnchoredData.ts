import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export default class AnchoredData {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id?: string;

  @Column()
  anchorFileHash: string;

  @Column()
  numberOfOperations: number;

  constructor(anchorFileHash: string, numberOfOperations: number) {
    this.anchorFileHash = anchorFileHash;
    this.numberOfOperations = numberOfOperations;
  }
}
