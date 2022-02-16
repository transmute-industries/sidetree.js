import * as React from 'react';
import { SxProps } from '@mui/system';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { Button, Drawer as MuiDrawer, Modal, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Theme as ThemeType } from '@mui/material/styles';

import { Theme } from './theme';

import { Drawer } from './drawer';

const drawerWidth = 240;

export const AppPage = (props: any) => {
  const { title, children } = props;
  const useAuth = props.method === 'photon';
  let maybeAccessToken;
  if (process.browser) {
    maybeAccessToken = localStorage.getItem('sidetree.access_token');
  }
  const accessToken: any = maybeAccessToken
    ? JSON.parse(maybeAccessToken)
    : undefined;

  const [isAuth, setIsAuth] = React.useState(useAuth && !accessToken);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [clientId, setClientId] = React.useState('');
  const [clientSecret, setClientSecret] = React.useState('');
  const [isInvalidCredentials, setIsInvalidCredentials] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const style: SxProps<ThemeType> = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const authenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/1.0/authenticate', {
      method: 'POST',
      body: JSON.stringify({ clientId, clientSecret }),
    });
    if (response.status === 401) {
      setIsInvalidCredentials(true);
    }
    if (response.status === 200) {
      const token = await response.json();
      localStorage.setItem(
        'sidetree.access_token',
        JSON.stringify(
          {
            accessToken: token.access_token,
            created: new Date().toISOString(),
          },
          null,
          2
        )
      );
      setIsAuth(false);
    }
  };

  return (
    <Theme>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Modal
          open={isAuth}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Client Credentials
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              <form onSubmit={authenticate}>
                <Box mb={2}>
                  <TextField
                    label="Cliend Id"
                    fullWidth
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                  />
                </Box>
                <TextField
                  label="Cliend Secret"
                  fullWidth
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                />
                {isInvalidCredentials && (
                  <Box mt={1}>
                    <Typography>Invalid Credentials</Typography>
                  </Box>
                )}
                <Box mt={2}>
                  <Button variant="contained" type="submit">
                    Authenticate
                  </Button>
                </Box>
              </form>
            </Typography>
          </Box>
        </Modal>
        <AppBar
          color={'transparent'}
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            {title && (
              <Typography variant="h6" noWrap component="div">
                {title}
              </Typography>
            )}
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="navigation"
        >
          <MuiDrawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
          >
            <Drawer logoLight={props.logoLight} logoDark={props.logoDark} />
          </MuiDrawer>
          <MuiDrawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
              },
            }}
            open
          >
            <Drawer logoLight={props.logoLight} logoDark={props.logoDark} />
          </MuiDrawer>
        </Box>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          {children}
        </Box>
      </Box>
    </Theme>
  );
};
