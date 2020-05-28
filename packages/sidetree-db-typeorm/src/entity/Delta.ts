import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export class Delta {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id?: string;

  @Column()
  // FIXME: there shouldn't be any "any"s
  patches: any[];

  @Column()
  updateCommitment: string;

  constructor(patches: any[], updateCommitment: string) {
    this.patches = patches;
    this.updateCommitment = updateCommitment;
  }
}
