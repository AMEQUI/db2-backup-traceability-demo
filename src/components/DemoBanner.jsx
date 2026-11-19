import { InlineNotification } from '@carbon/react';

export default function DemoBanner() {
  return (
    <div className="demo-banner">
      <InlineNotification
        kind="info"
        lowContrast
        hideCloseButton
        title="Demonstration Environment"
        subtitle="All data is synthetic. No real client data or PII is used. Product screens are simulated and figures marked illustrative are not measured results."
      />
    </div>
  );
}
