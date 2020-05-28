import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export class ChunkFile {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id?: string;

  @Column()
  deltas: string[];

  constructor(deltas: string[]) {
    this.deltas = deltas;
  }
}
