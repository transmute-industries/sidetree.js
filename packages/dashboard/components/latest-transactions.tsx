import React from "react";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";

import moment from "moment";

const rows: GridRowsProp = [
  {
    id: 1,
    number: "1",
    hash: "0xccfd408062bf59c7e3b1557b62a3fbb3fdd5b574d5d2b44b1fb731cdd4c36475",
    createCount: 1,
    updateCount: 0,
    deactivateCount: 0,
    timestamp: "2015-10-03T23:16:03.790Z",
  },
  {
    id: 2,
    number: "2",
    hash: "0x811347cc5a2c4fcf51b6cfdb88632c40dc767ded91986697b194b243420c94fc",
    createCount: 0,
    updateCount: 2,
    deactivateCount: 3,
    timestamp: "2017-10-03T23:16:03.790Z",
  },
  {
    id: 3,
    number: "3",
    hash: "0x2a38ff845ccf148100bffbae33b0c34c6025e59ad66632554900505410edc265",
    createCount: 0,
    updateCount: 0,
    deactivateCount: 15,
    timestamp: "2020-10-03T23:16:03.790Z",
  },
]
  .map((v) => {
    return { ...v, timestamp: moment(v.timestamp).fromNow() };
  })
  .reverse();

const columns: GridColDef[] = [
  { field: "number", headerName: "Transaction", width: 125 },
  //   { field: "hash", headerName: "Hash", width: 150 },
  { field: "createCount", headerName: "Created" },
  { field: "updateCount", headerName: "Updated" },
  { field: "deactivateCount", headerName: "Removed" },

  { field: "timestamp", headerName: "Date" },
];

export const LatestTransactions = () => {
  return (
    <div style={{ height: 300, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  );
};
