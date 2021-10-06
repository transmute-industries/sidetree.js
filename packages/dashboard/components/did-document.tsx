import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { red } from "@mui/material/colors";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const example = {
  "@context": [
    "https://www.w3.org/ns/did/v1",
    "https://w3id.org/security/suites/jws-2020/v1",
  ],
  id: "did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW",
  verificationMethod: [
    {
      id: "did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW",
      type: "JsonWebKey2020",
      controller: "did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW",
      publicKeyJwk: {
        kty: "OKP",
        crv: "Ed25519",
        x: "ajER1qrmGvrCaCrAV_Ul23kT94cSfui3GQ92Oyu0e40",
      },
    },
    {
      id: "did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6LSq1CX2VmDsnXTnJgWFUQyQnsX7LzgEEKfh4wPsoqCLnGi",
      type: "JsonWebKey2020",
      controller: "did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW",
      publicKeyJwk: {
        kty: "OKP",
        crv: "X25519",
        x: "xgd-7opG1_aoxhF9uQLRRd_Vhhhx2HLdZ5YFm32hrAs",
      },
    },
  ],
  assertionMethod: [
    "did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW",
  ],
  authentication: [
    "did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW",
  ],
  capabilityInvocation: [
    "did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW",
  ],
  capabilityDelegation: [
    "did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW",
  ],
  keyAgreement: [
    "did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6LSq1CX2VmDsnXTnJgWFUQyQnsX7LzgEEKfh4wPsoqCLnGi",
  ],
};

const ExpandMore = styled((props: any) => {
  const { expand, ...other }: any = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export const DidDocument = () => {
  const [credentialsExpanded, setExpandCredentials] = React.useState(false);
  const handleExpandCredentials = () => {
    setExpandCredentials(!credentialsExpanded);
  };

  const [presentationsExpanded, setExpandPresentations] = React.useState(false);
  const handleExpandPresentations = () => {
    setExpandPresentations(!presentationsExpanded);
  };
  const [servicesExpanded, setExpandServices] = React.useState(false);
  const handleExpandServices = () => {
    setExpandServices(!servicesExpanded);
  };

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="recipe">
            R
          </Avatar>
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={example.id}
        subheader={"Last updated September 14, 2016"}
      />

      <CardContent>
        <Typography variant="body2" color="text.secondary">
          This impressive paella is a perfect party dish and a fun meal to cook
          together with your guests. Add 1 cup of frozen peas along with the
          mussels, if you like.
        </Typography>
      </CardContent>

      <CardActions disableSpacing>
        <Typography variant="h4" style={{ paddingLeft: "10px" }}>
          Credentials
        </Typography>
        <ExpandMore
          expand={credentialsExpanded}
          onClick={handleExpandCredentials}
          aria-expanded={credentialsExpanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <Collapse in={credentialsExpanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>
            This DID is configured to create verifiable credentials as an
            issuer.
          </Typography>
        </CardContent>
      </Collapse>

      <CardActions disableSpacing>
        <Typography variant="h4" style={{ paddingLeft: "10px" }}>
          Presentations
        </Typography>
        <ExpandMore
          expand={presentationsExpanded}
          onClick={handleExpandPresentations}
          aria-expanded={presentationsExpanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <Collapse in={presentationsExpanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>
            This DID is configured to present verifiable credentials as a
            holder.
          </Typography>
        </CardContent>
      </Collapse>

      <CardActions disableSpacing>
        <Typography variant="h4" style={{ paddingLeft: "10px" }}>
          Services
        </Typography>
        <ExpandMore
          expand={servicesExpanded}
          onClick={handleExpandServices}
          aria-expanded={servicesExpanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <Collapse in={servicesExpanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>
            This DID has not been configured to expose any services.
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};
