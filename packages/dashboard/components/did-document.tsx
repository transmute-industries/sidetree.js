import * as React from 'react';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { red } from '@mui/material/colors';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import RefreshIcon from '@mui/icons-material/Refresh';
const ExpandMore = styled((props: any) => {
  const { expand, ...other }: any = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export const DidDocument = ({ didDocument, operationCount, refresh }: any) => {
  const [
    verificationMethodsExpanded,
    setVerificationMethodsExpanded,
  ] = React.useState(false);

  const handleExpandVerificationMethods = () => {
    setVerificationMethodsExpanded(!verificationMethodsExpanded);
  };

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
          <Avatar sx={{ bgcolor: red[500], fontSize: '16px' }} aria-label="DID">
            {didDocument.id.substr(-4)}
          </Avatar>
        }
        action={
          refresh ? (
            <IconButton aria-label="refresh" onClick={refresh}>
              <RefreshIcon />
            </IconButton>
          ) : (
            <></>
          )
        }
        title={didDocument.id}
        subheader={operationCount + ' operations'}
      />

      <CardActions disableSpacing>
        <Typography variant="h4" style={{ paddingLeft: '10px' }}>
          Verification
        </Typography>
        <ExpandMore
          expand={verificationMethodsExpanded}
          onClick={handleExpandVerificationMethods}
          aria-expanded={verificationMethodsExpanded}
          aria-label="show more"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>

      <Collapse in={verificationMethodsExpanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>This DID has verification keys.</Typography>
          <pre>{JSON.stringify(didDocument.verificationMethod, null, 2)}</pre>
        </CardContent>
      </Collapse>

      <CardActions disableSpacing>
        <Typography variant="h4" style={{ paddingLeft: '10px' }}>
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
          <pre>{JSON.stringify(didDocument.assertionMethod, null, 2)}</pre>
        </CardContent>
      </Collapse>

      <CardActions disableSpacing>
        <Typography variant="h4" style={{ paddingLeft: '10px' }}>
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
          <pre>{JSON.stringify(didDocument.authentication, null, 2)}</pre>
        </CardContent>
      </Collapse>

      <CardActions disableSpacing>
        <Typography variant="h4" style={{ paddingLeft: '10px' }}>
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
          <pre>{JSON.stringify(didDocument.service, null, 2)}</pre>
        </CardContent>
      </Collapse>
    </Card>
  );
};
