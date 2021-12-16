import * as React from 'react';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import { ListSubheader } from '@mui/material';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import Toolbar from '@mui/material/Toolbar';

import { DarkModeToggle } from './dark-mode-toggle';
import { CompanyLogo } from './company-logo';

import CodeIcon from '@mui/icons-material/Code';
import AddIcon from '@mui/icons-material/Add';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArticleIcon from '@mui/icons-material/Article';
import SaveIcon from '@mui/icons-material/Save';
import ArchiveIcon from '@mui/icons-material/Archive';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useRouter } from 'next/router';

export const Drawer = ({ logoLight, logoDark }: any) => {
  const router = useRouter();
  console.log();
  const [hideUI, setHideUI] = useState(false);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Toolbar>
          <CompanyLogo
            sx={{ height: '32px' }}
            logoLight={logoLight}
            logoDark={logoDark}
          />
        </Toolbar>
        <Divider />

        <List
          subheader={<ListSubheader component="div">Explore</ListSubheader>}
        >
          <ListItem
            selected={router.pathname === '/transactions'}
            button
            onClick={() => {
              router.push('/transactions');
            }}
          >
            <ListItemIcon>
              <ReceiptIcon />
            </ListItemIcon>
            <ListItemText primary={'Transactions'} />
          </ListItem>

          <ListItem
            selected={router.pathname === '/operations'}
            button
            onClick={() => {
              router.push('/operations');
            }}
          >
            <ListItemIcon>
              <ChangeHistoryIcon />
            </ListItemIcon>
            <ListItemText primary={'Operations'} />
          </ListItem>
        </List>
        <Divider />
        <List subheader={<ListSubheader component="div">Wallet</ListSubheader>}>
          <ListItem
            selected={router.pathname === '/wallet'}
            button
            onClick={() => {
              router.push('/wallet');
            }}
          >
            <ListItemIcon>
              <AccountBalanceWalletIcon />
            </ListItemIcon>
            <ListItemText primary={'Wallet'} />
          </ListItem>
        </List>

        <Divider />
        <List
          subheader={<ListSubheader component="div">Operations</ListSubheader>}
        >
          <ListItem
            selected={router.pathname === '/create'}
            button
            onClick={() => {
              router.push('/create');
            }}
          >
            <ListItemIcon>
              <AddIcon />
            </ListItemIcon>
            <ListItemText primary={'Create'} />
          </ListItem>

          <ListItem
            selected={
              router.pathname === '/resolve' || router.pathname === '/[did]'
            }
            button
            onClick={() => {
              router.push('/resolve');
            }}
          >
            <ListItemIcon>
              <ManageSearchIcon />
            </ListItemIcon>
            <ListItemText primary={'Resolve'} />
          </ListItem>

          {hideUI && (
            <ListItem button disabled={true}>
              <ListItemIcon>
                <SaveIcon />
              </ListItemIcon>
              <ListItemText primary={'Update'} />
            </ListItem>
          )}

          {hideUI && (
            <ListItem button disabled={true}>
              <ListItemIcon>
                <ArchiveIcon />
              </ListItemIcon>
              <ListItemText primary={'Deactivate'} />
            </ListItem>
          )}
        </List>
        <Divider />
        <List
          subheader={<ListSubheader component="div">Developers</ListSubheader>}
        >
          <ListItem
            button
            onClick={() => {
              router.push('/docs');
            }}
          >
            <ListItemIcon>
              <ArticleIcon />
            </ListItemIcon>
            <ListItemText primary={'Documentation'} />
          </ListItem>

          <ListItem
            button
            component="a"
            href="https://github.com/transmute-industries/sidetree.js"
          >
            <ListItemIcon>
              <CodeIcon />
            </ListItemIcon>
            <ListItemText primary={'Source Code'} />
          </ListItem>
        </List>
      </Box>
      <Box sx={{ p: 1 }}>
        <DarkModeToggle />
      </Box>
    </Box>
  );
};
