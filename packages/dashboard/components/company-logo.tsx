/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import { useTheme } from "@mui/material/styles";

import { useRouter } from "next/router";

export const CompanyLogo = ({ sx }: any) => {
  const theme = useTheme();
  const router = useRouter();
  const logo =
    theme.palette.mode === "dark"
      ? "/assets/logo-with-text.white.svg"
      : "/assets/logo-with-text.purple.svg";

  return (
    <img
      src={logo}
      alt="logo"
      style={{ cursor: "pointer", height: sx?.height || "32px" }}
      onClick={() => {
        router.push("/");
      }}
    />
  );
};
