import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`identifier-tabpanel-${index}`}
      aria-labelledby={`identifier-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index: any) {
  return {
    id: `identifier-tab-${index}`,
    'aria-controls': `identifier-tabpanel-${index}`,
  };
}

export default function IdentifierTabs({
  didDocument,
  wallet,
  operations,
}: any) {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: any, newValue: any) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="identifier tabs"
        >
          <Tab label="Identifier" {...a11yProps(0)} />
          <Tab label="Wallet" {...a11yProps(1)} />
          <Tab label="Operations" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {didDocument}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {wallet}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {operations}
      </TabPanel>
    </Box>
  );
}
