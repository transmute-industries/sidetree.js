import { Chip } from "@mui/material";

export const DID = ({ did }: { did: string }) => {
  return (
    <>
      <Chip label={did} />
      <Chip label={did} color={"primary"} />
      <Chip label={did} color={"secondary"} />
    </>
  );
};
