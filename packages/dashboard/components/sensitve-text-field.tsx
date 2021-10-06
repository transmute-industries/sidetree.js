import * as React from 'react';
import { TextField, Tooltip } from '@mui/material';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import FileCopy from '@mui/icons-material/FileCopy';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export const SensitiveTextField = ({ label, value }: any) => {
  const [hidden, setHidden] = React.useState(true);
  return (
    <TextField
      label={label}
      fullWidth
      type={hidden ? 'password' : 'text'}
      value={value}
      autoComplete="current-password"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              size={'small'}
              aria-label="toggle password visibility"
              onClick={() => {
                setHidden(!hidden);
              }}
            >
              {hidden ? <Visibility /> : <VisibilityOff />}
            </IconButton>

            <Tooltip title="Copy to clipboard">
              <IconButton
                aria-label="Copy to clipboard"
                onClick={() => {
                  const myTemporaryInputElement = document.createElement(
                    'input'
                  );
                  myTemporaryInputElement.type = 'text';
                  myTemporaryInputElement.value = value;
                  document.body.appendChild(myTemporaryInputElement);
                  myTemporaryInputElement.select();
                  document.execCommand('Copy');
                  document.body.removeChild(myTemporaryInputElement);
                  alert('copied sensitive data to clipboard.');
                }}
              >
                <FileCopy />
              </IconButton>
            </Tooltip>
          </InputAdornment>
        ),
      }}
    />
  );
};
