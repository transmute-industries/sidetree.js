import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export default class Delta {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id?: string;

  @Column()
  patches: any[];

  @Column()
  update_commitment: string;

  constructor(patches: any[], update_commitment: string) {
    this.patches = patches;
    this.update_commitment = update_commitment;
  }
}
