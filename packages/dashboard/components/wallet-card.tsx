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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import { SensitiveTextField } from './sensitve-text-field';

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

const example = {
  '@context': [
    'https://www.w3.org/ns/did/v1',
    'https://w3id.org/security/suites/jws-2020/v1',
  ],
  id: 'did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW',
  verificationMethod: [
    {
      id:
        'did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW',
      type: 'JsonWebKey2020',
      controller: 'did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'Ed25519',
        x: 'ajER1qrmGvrCaCrAV_Ul23kT94cSfui3GQ92Oyu0e40',
      },
    },
    {
      id:
        'did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6LSq1CX2VmDsnXTnJgWFUQyQnsX7LzgEEKfh4wPsoqCLnGi',
      type: 'JsonWebKey2020',
      controller: 'did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW',
      publicKeyJwk: {
        kty: 'OKP',
        crv: 'X25519',
        x: 'xgd-7opG1_aoxhF9uQLRRd_Vhhhx2HLdZ5YFm32hrAs',
      },
    },
  ],
  assertionMethod: [
    'did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW',
  ],
  authentication: [
    'did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW',
  ],
  capabilityInvocation: [
    'did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW',
  ],
  capabilityDelegation: [
    'did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW',
  ],
  keyAgreement: [
    'did:key:z6MkmbnfArNcUhGX5GFtHfCXnz1ie8HL29Eaxj5Fi4HLmDRW#z6LSq1CX2VmDsnXTnJgWFUQyQnsX7LzgEEKfh4wPsoqCLnGi',
  ],
};

export const WalletActionsMenu = () => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls="long-menu"
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem
          // selected={option === 'Pyxis'}
          onClick={() => {
            localStorage.removeItem('sidetree.wallet');
            window.location.reload();
            handleClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </div>
  );
};
export const WalletCard = ({ wallet }: any) => {
  const [credentialsExpanded, setExpandCredentials] = React.useState(false);
  const handleExpandCredentials = () => {
    setExpandCredentials(!credentialsExpanded);
  };

  const mnemonics = wallet.contents.filter((i: any) => {
    return i.type == 'Mnemonic';
  });

  return (
    <Card>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: red[500] }} aria-label="wallet">
            <AccountBalanceWalletIcon />
          </Avatar>
        }
        action={<WalletActionsMenu />}
        title={'Local Storage Wallet'}
        subheader={`${wallet.contents.length} Items`}
      />

      <CardContent>
        <Typography variant="body2" color="text.secondary">
          Content is saved in local storage.
        </Typography>
      </CardContent>

      {mnemonics.length > 0 && (
        <>
          <CardActions disableSpacing>
            <Typography variant="h4" style={{ paddingLeft: '10px' }}>
              Mnemonics
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
              {mnemonics.map((m: any) => {
                return (
                  <div key={m.id}>
                    <SensitiveTextField label={m.id} value={m.value} />
                  </div>
                );
              })}
            </CardContent>
          </Collapse>
        </>
      )}
    </Card>
  );
};
