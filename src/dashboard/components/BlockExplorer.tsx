import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid2';
import Typography from '@mui/material/Typography';
import { LineChart } from '@mui/x-charts/LineChart';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

interface BlockData {
  block: {
    hash: string;
    time_unix_millis: number;
    connected_time_unix_millis: number;
  };
  prev_block: {
    hash: string;
    time_unix_millis: number;
    connected_time_unix_millis: number;
  };
  mined_tx_count: number;
  missing_from_mempool_tx_count: number;
  propagation_timeline: Array<{
    time_unix_millis: number;
    tx_count: number;
  }>;
}

export default function BlockExplorer() {
  const theme = useTheme();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [blockData, setBlockData] = React.useState<BlockData | null>(null);
  
  React.useEffect(() => {
    const fetchBlockData = async () => {
      try {
        const response = await fetch('https://bitcoin-monitor-flare.stringintech.workers.dev/block-stats/latest');
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();
        setBlockData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching block data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setLoading(false);
      }
    };

    fetchBlockData();
  }, []);

  const generateChartData = (data: BlockData) => {
    if (!data || !data.block.connected_time_unix_millis || !data.prev_block.connected_time_unix_millis) {
      return { xValues: [], yValues: [] };
    }

    const xValues = data.propagation_timeline.map(p => new Date(p.time_unix_millis));
    const yValues = data.propagation_timeline.map(p => p.tx_count);
    
    return { xValues, yValues };
  };
  
  const formatHash = (hash: string) => {
    if (!hash) return '';
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 5)}`;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading block data: {error}
      </Alert>
    );
  }
  
  if (!blockData) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        No block data available
      </Alert>
    );
  }
  
  const { xValues, yValues } = generateChartData(blockData);

  return (
    <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
      {/* <Card variant="outlined" sx={{ mb: 2 }}> */}
        {/* <CardContent> */}
          <Typography component="h1" variant="h5" gutterBottom>
            Block Transaction Propagation Timeline
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'left' }}>
            Shows the number of block transactions known to our node at regular intervals before the block was received. While we can't determine exactly when a miner solved the block or how long network propagation took, this timeline reveals whether our node had advance knowledge of transactions, helping diagnose network connectivity issues or identify blocks containing unusual transaction sets not previously broadcast to the network.
          </Typography>
        {/* </CardContent> */}
      {/* </Card> */}
      
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography component="h2" variant="subtitle2" gutterBottom>
                Current Block
              </Typography>
              <Typography variant="body2">
                Hash: {formatHash(blockData.block.hash)}
              </Typography>
              <Typography variant="body2">
                Time: {new Date(blockData.block.time_unix_millis).toUTCString()}
              </Typography>
              <Typography variant="body2">
                Connected: {new Date(blockData.block.connected_time_unix_millis || '').toUTCString()}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography component="h2" variant="subtitle2" gutterBottom>
                Previous Block
              </Typography>
              <Typography variant="body2">
                Hash: {formatHash(blockData.prev_block.hash)}
              </Typography>
              <Typography variant="body2">
                Time: {new Date(blockData.prev_block.time_unix_millis).toUTCString()}
              </Typography>
              <Typography variant="body2">
                Connected: {new Date(blockData.prev_block.connected_time_unix_millis || '').toUTCString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography component="h2" variant="subtitle2" gutterBottom>
                Total Transactions
              </Typography>
              <Typography variant="h3" component="div">
                {blockData.mined_tx_count.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography component="h2" variant="subtitle2" gutterBottom>
                Missing Transactions
              </Typography>
              <Typography variant="h3" component="div">
                {blockData.missing_from_mempool_tx_count.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Card variant="outlined">
        <CardContent>
          {/* <Typography component="h2" variant="subtitle2" gutterBottom>
            Transaction Visibility Over Time
          </Typography> */}
          <Box sx={{ height: 400, width: '100%' }}>
            {xValues.length > 0 && yValues.length > 0 ? (
              <LineChart
                series={[
                  {
                    data: yValues,
                    // label: 'Transactions',
                    curve: 'linear',
                    showMark: true,
                    color: theme.palette.primary.main,
                  },
                ]}
                xAxis={[
                  {
                    data: xValues,
                    scaleType: 'time',
                    valueFormatter: (date) => {
                      return new Date(date).toISOString().substring(11, 19);
                    },
                  },
                ]}
                // yAxis={[
                //   {
                //     min: 0  // This forces y-axis to start from zero
                //   }
                // ]}
                grid={{ vertical: true, horizontal: true }}
                height={350}
              />
            ) : (
              <Typography>No chart data available</Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}