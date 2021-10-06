import React from "react";
import { Chip } from "@mui/material";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { useRouter } from "next/router";

import moment from "moment";

export const RecentOperations = () => {
  const router = useRouter();

  const rows: GridRowsProp = [
    {
      id: 1,
      hash: "0xccfd408062bf59c7e3b1557b62a3fbb3fdd5b574d5d2b44b1fb731cdd4c36475",
      operation: "Created",
      timestamp: "2015-10-03T23:16:03.790Z",
    },
    {
      id: 2,
      hash: "0x811347cc5a2c4fcf51b6cfdb88632c40dc767ded91986697b194b243420c94fc",
      operation: "Updated",
      timestamp: "2017-10-03T23:16:03.790Z",
    },
    {
      id: 3,
      hash: "0x2a38ff845ccf148100bffbae33b0c34c6025e59ad66632554900505410edc265",
      operation: "Deactivated",
      timestamp: "2020-10-03T23:16:03.790Z",
    },
  ]
    .map((v) => {
      return { ...v, timestamp: moment(v.timestamp).fromNow() };
    })
    .reverse();

  const columns: GridColDef[] = [
    {
      field: "hash",
      headerName: "Transaction",
      width: 300,
      renderCell: ({ value }: any) => (
        <Chip
          label={`${value.substring(0, 32) + "..."}`}
          onClick={() => {
            router.push("/transactions/" + value);
          }}
        />
      ),
    },
    { field: "operation", headerName: "Operation", width: 200 },
    { field: "timestamp", headerName: "Date" },
  ];
  return (
    <div style={{ height: 300, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  );
};
