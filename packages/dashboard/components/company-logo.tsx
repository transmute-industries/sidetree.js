/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/router';

export const CompanyLogo = ({ sx, logoLight, logoDark }: any) => {
  const theme = useTheme();
  const router = useRouter();

  const logo = theme.palette.mode === 'dark' ? logoLight : logoDark;

  return (
    <img
      src={logo}
      alt="logo"
      style={{ cursor: 'pointer', height: sx?.height || '32px' }}
      onClick={() => {
        router.push('/');
      }}
    />
  );
};
