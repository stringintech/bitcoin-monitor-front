import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import { GridCellParams, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';

type SparkLineData = number[];

function getDaysInMonth(month: number, year: number) {
  const date = new Date(year, month, 0);
  const monthName = date.toLocaleDateString('en-US', {
    month: 'short',
  });
  const daysInMonth = date.getDate();
  const days = [];
  let i = 1;
  while (days.length < daysInMonth) {
    days.push(`${monthName} ${i}`);
    i += 1;
  }
  return days;
}

function renderSparklineCell(params: GridCellParams<SparkLineData, any>) {
  const data = getDaysInMonth(4, 2024);
  const { value, colDef } = params;

  if (!value || value.length === 0) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      <SparkLineChart
        data={value}
        width={colDef.computedWidth || 100}
        height={32}
        plotType="bar"
        showHighlight
        showTooltip
        colors={['hsl(210, 98%, 42%)']}
        xAxis={{
          scaleType: 'band',
          data,
        }}
      />
    </div>
  );
}

function renderStatus(status: 'Online' | 'Offline') {
  const colors: { [index: string]: 'success' | 'default' } = {
    Online: 'success',
    Offline: 'default',
  };

  return <Chip label={status} color={colors[status]} size="small" />;
}

export function renderAvatar(
  params: GridCellParams<{ name: string; color: string }, any, any>,
) {
  if (params.value == null) {
    return '';
  }

  return (
    <Avatar
      sx={{
        backgroundColor: params.value.color,
        width: '24px',
        height: '24px',
        fontSize: '0.85rem',
      }}
    >
      {params.value.name.toUpperCase().substring(0, 1)}
    </Avatar>
  );
}

export const columns: GridColDef[] = [
  { field: 'ip', headerName: 'IP Address', flex: 1.5, minWidth: 180 },
  {
    field: 'ipVersion',
    headerName: 'IP Version',
    flex: 0.7,
    minWidth: 100,
    align: 'center',
  },
  {
    field: 'inbound',
    headerName: 'Direction',
    flex: 0.8,
    minWidth: 110,
    renderCell: (params) => params.value ? 'Inbound' : 'Outbound',
  },
  {
    field: 'connectionType',
    headerName: 'Connection Type',
    flex: 1.2,
    minWidth: 160,
  },
  {
    field: 'country',
    headerName: 'Country',
    flex: 1,
    minWidth: 120,
  },
  {
    field: 'ping',
    headerName: 'Ping (ms)',
    type: 'number',
    flex: 0.8,
    minWidth: 100,
    align: 'right',
  },
];

function generateIPv4() {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function generateIPv6() {
  const segments = [];
  for (let i = 0; i < 8; i++) {
    segments.push(Math.floor(Math.random() * 65536).toString(16).padStart(4, '0'));
  }
  return segments.join(':');
}

const connectionTypes = ['outbound-full-relay', 'inbound', 'block-relay-only'];
const countries = ['United States', 'Germany', 'Japan', 'France', 'Canada', 'United Kingdom', 'Netherlands', 'Australia', 'China', 'Singapore', 'Brazil', 'South Korea'];

// Create 60 rows of dummy data
export const rows: GridRowsProp = Array.from({ length: 60 }, (_, index) => {
  const isIPv6 = Math.random() > 0.6;
  const isInbound = Math.random() > 0.7;

  return {
    id: index + 1,
    ip: isIPv6 ? generateIPv6() : generateIPv4(),
    ipVersion: isIPv6 ? 'IPv6' : 'IPv4',
    inbound: isInbound,
    connectionType: isInbound ? 'inbound' : connectionTypes[Math.floor(Math.random() * connectionTypes.length)],
    country: countries[Math.floor(Math.random() * countries.length)],
    ping: Math.floor(Math.random() * 300) + 10,
  };
});
