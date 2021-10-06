import C3Chart from "react-c3js";
import "c3/c3.css";

import { useTheme } from "@mui/material/styles";

export const LatestTransactionsChart = () => {
  const conf = {
    data: {
      colors: {
        creates: "#388E3C",
        updates: "#1E88E5",
        deactivates: "#EF5350",
      },
      x: "x",
      columns: [
        [
          "x",
          "2013-01-01",
          "2013-01-02",
          "2013-01-03",
          "2013-01-04",
          "2013-01-05",
          "2013-01-06",
        ],
        ["creates", 30, 200, 62, 82, 23, 1],
        ["updates", 20, 42, 63, 12, 25, 2],
        ["deactivates", 10, 24, 25, 53, 72, 23],
      ],
    },
    axis: {
      y: {
        label: "Count",
      },
      x: {
        label: "Days",
        type: "timeseries",
        tick: {
          format: "%Y-%m-%d",
        },
      },
    },
  };

  const theme = useTheme();
  const className = theme.palette.mode === "dark" ? "inverted" : "";
  return (
    <div style={{ padding: "32px" }} className={className}>
      <C3Chart {...conf} />
    </div>
  );
};
