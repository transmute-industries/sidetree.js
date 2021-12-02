import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function OperationAccordion({ operation }: any) {
  const { id, ...op } = operation;
  return (
    <div>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="operation-panel-content"
          id="operation-panel-header"
        >
          <Typography>
            {id} - {operation.type}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre>{JSON.stringify(op, null, 2)}</pre>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
