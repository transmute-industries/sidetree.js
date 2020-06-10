import { Entity, Column, PrimaryColumn, ObjectIdColumn } from 'typeorm';

@Entity()
export default class AnchorFile {
  @PrimaryColumn()
  @ObjectIdColumn()
  _id?: string;

  @Column()
  mapFileUri: string;

  @Column()
  operations: {
    create?: {
      suffixData: string;
    }[];
    recover?: {
      didSuffix: string;
      signedData: string;
    }[];
    deactivate?: {
      didSuffix: string;
      signedData: string;
    }[];
  };

  constructor(
    mapFileUri: string,
    operations: {
      create?: {
        suffixData: string;
      }[];
      recover?: {
        didSuffix: string;
        signedData: string;
      }[];
      deactivate?: {
        didSuffix: string;
        signedData: string;
      }[];
    }
  ) {
    this.mapFileUri = mapFileUri;
    this.operations = operations;
  }
}
