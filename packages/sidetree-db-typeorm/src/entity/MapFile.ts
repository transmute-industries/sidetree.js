import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export default class MapFile {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id?: string;

  @Column()
  chunks: {
    chunk_file_uri: string;
  }[];

  @Column()
  operations?: {
    update: {
      did_suffix: string;
      signed_data: string;
    }[];
  };

  constructor(
    chunks: {
      chunk_file_uri: string;
    }[],
    operations?: {
      update: {
        did_suffix: string;
        signed_data: string;
      }[];
    }
  ) {
    this.chunks = chunks;
    this.operations = operations;
  }
}
