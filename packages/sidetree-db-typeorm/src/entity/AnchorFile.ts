import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export class AnchorFile {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id?: string;

  @Column()
  map_file_uri: string;

  @Column()
  operations: {
    create?: {
      suffix_data: string;
    }[];
    recover?: {
      did_suffix: string;
      signed_data: string;
    }[];
    deactivate?: {
      did_suffix: string;
      signed_data: string;
    }[];
  };

  constructor(
    map_file_uri: string,
    operations: {
      create?: {
        suffix_data: string;
      }[];
      recover?: {
        did_suffix: string;
        signed_data: string;
      }[];
      deactivate?: {
        did_suffix: string;
        signed_data: string;
      }[];
    }
  ) {
    this.map_file_uri = map_file_uri;
    this.operations = operations;
  }
}
