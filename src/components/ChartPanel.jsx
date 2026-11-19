import { useMemo } from 'react';
import { Tile, SkeletonText, InlineNotification } from '@carbon/react';
import { GroupedBarChart, StackedBarChart, SimpleBarChart } from '@carbon/charts-react';
import { IBM_COLORS } from '../utils/formatters.js';

const TYPES = { bar: SimpleBarChart, groupedBar: GroupedBarChart, stackedBar: StackedBarChart };

// Wrapper: Carbon Charts in a Tile, g90 theme, toolbar disabled, with loading / error / empty states.
export default function ChartPanel({ type, title, data, options = {}, loading, error, height = '300px', colors }) {
  const Chart = TYPES[type];
  const opts = useMemo(
    () => ({
      title,
      theme: 'g90',
      height,
      resizable: true,
      toolbar: { enabled: false },
      accessibility: { svgAriaLabel: title },
      ...(colors ? { color: { scale: colors } } : {}),
      ...options,
    }),
    [title, height, colors, options],
  );

  return (
    <Tile className="chart-panel">
      {loading ? (
        <SkeletonText heading paragraph lineCount={5} />
      ) : error ? (
        <InlineNotification kind="error" lowContrast hideCloseButton title="Chart unavailable" subtitle={String(error)} />
      ) : !data || data.length === 0 ? (
        <div className="empty-state" role="status">
          <strong>{title}</strong>
          <p>No data to display.</p>
        </div>
      ) : (
        <Chart data={data} options={opts} />
      )}
    </Tile>
  );
}

export const PALETTE = [IBM_COLORS.blue, IBM_COLORS.purple, IBM_COLORS.teal, IBM_COLORS.magenta, IBM_COLORS.red, IBM_COLORS.green];
