import React from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const columns: GridColDef[] = [
  { field: 'transactionNumber', headerName: 'Number' },
  { field: 'transactionTime', headerName: 'Time' },
  { field: 'transactionTimeHash', headerName: 'Hash', width: 128 },
  { field: 'anchorString', headerName: 'Anchor', width: 128 },
];

export const LatestTransactions = ({ transactions }: any) => {
  const transactionsWithId = transactions.map((t: any) => {
    return { id: t.transactionTimeHash, ...t };
  });
  return (
    <div style={{ height: 300, width: '100%' }}>
      <DataGrid rows={transactionsWithId} columns={columns} />
    </div>
  );
};
