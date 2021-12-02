import React from 'react';

import OperationAccordion from './operation-json-accordion';

export const RecentOperations = ({ operations }: any) => {
  const rows: any = operations.map((v: any, i: any) => {
    return { ...v, id: i };
  });

  return (
    <div style={{ width: '100%' }}>
      {rows.map((r: any) => {
        return <OperationAccordion operation={r} key={r.id} />;
      })}
    </div>
  );
};
