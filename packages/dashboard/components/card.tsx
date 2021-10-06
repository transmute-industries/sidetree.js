import * as React from "react";
import { Card as MuiCard } from "@mui/material";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";

export const Card = ({ title, image, description, actions }: any) => {
  return (
    <MuiCard>
      {image && (
        <CardMedia
          component="img"
          height="140"
          image={image}
          alt="card image"
        />
      )}

      <CardContent>
        {title && (
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
        )}

        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  );
};
