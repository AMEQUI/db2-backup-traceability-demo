import { Tile } from '@carbon/react';
import { ArrowUp, ArrowDown } from '@carbon/icons-react';

// tone: 'success' | 'warning' | 'danger'
export default function KPICard({ title, value, unit, note, tone = 'success', icon: Icon, trend }) {
  return (
    <Tile className={`kpi-card kpi-card--${tone}`} aria-label={`${title}: ${value} ${unit || ''}`}>
      <div className="kpi-card__head">
        <span className="kpi-card__title">{title}</span>
        {Icon ? <Icon size={20} aria-hidden="true" /> : null}
      </div>
      <div className="kpi-card__value">
        {value}
        {unit ? <span className="kpi-card__unit"> {unit}</span> : null}
        {trend === 'up' ? <ArrowUp size={20} aria-label="trending up" /> : null}
        {trend === 'down' ? <ArrowDown size={20} aria-label="trending down" /> : null}
      </div>
      {note ? <div className="kpi-card__note">{note}</div> : null}
    </Tile>
  );
}
