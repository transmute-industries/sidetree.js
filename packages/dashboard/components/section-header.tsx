import { Typography } from "@mui/material";

export const SectionHeader = ({ title, description }: any) => {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px",
        maxWidth: "75%",
        margin: "auto",
      }}
    >
      {title && (
        <Typography variant={"h4"} gutterBottom>
          {title}
        </Typography>
      )}
      {description && <Typography>{description}</Typography>}
    </div>
  );
};
