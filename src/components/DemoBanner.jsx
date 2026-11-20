import { InlineNotification } from '@carbon/react';

// Synthetic-data disclaimer, kept on every page. No title text by request.
export default function DemoBanner() {
  return (
    <div className="demo-banner">
      <InlineNotification
        kind="info"
        lowContrast
        hideCloseButton
        title=""
        subtitle="All data is synthetic. No real client data or PII is used. Product screens are simulated and figures marked illustrative are not measured results."
      />
    </div>
  );
}
