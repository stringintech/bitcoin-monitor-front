import * as React from 'react';
import {DataGrid} from '@mui/x-data-grid';
import {columns} from '../internals/data/gridData';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

interface PeerData {
    ip: string;
    ip_version: string;
    inbound: boolean;
    connection_type: string;
    country: string;
    ping: number;
}

export default function CustomizedDataGrid() {
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [peerData, setPeerData] = React.useState<any[]>([]);

    React.useEffect(() => {
        const fetchPeerData = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await fetch('https://bitcoin-monitor-flare.stringintech.workers.dev/peers');

                if (!response.ok) {
                    throw new Error(`API request failed with status ${response.status}`);
                }

                const data: PeerData[] = await response.json();

                // Transform the data to match our grid format
                const transformedData = data.map((peer, index) => ({
                    id: index + 1,
                    ip: peer.ip,
                    ipVersion: peer.ip_version,
                    inbound: peer.inbound,
                    connectionType: peer.connection_type || (peer.inbound ? 'inbound' : 'outbound-full-relay'),
                    country: peer.country || 'Unknown',
                    ping: Math.round(peer.ping * 1000), // Convert to milliseconds
                }));

                setPeerData(transformedData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching peer data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                setLoading(false);
            }
        };

        fetchPeerData();
    }, []);

    if (loading) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{mb: 2}}>
                Error loading peer data: {error}
            </Alert>
        );
    }

    return (
        <>
            <Typography variant="h6" sx={{mb: 2}}>
                Bitcoin Node Peer Connections
            </Typography>
            <DataGrid
                checkboxSelection
                rows={peerData}
                columns={columns}
                getRowClassName={(params) =>
                    params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd'
                }
                initialState={{
                    pagination: {paginationModel: {pageSize: 20}},
                }}
                pageSizeOptions={[10, 20, 50]}
                disableColumnResize
                density="compact"
                slotProps={{
                    filterPanel: {
                        filterFormProps: {
                            logicOperatorInputProps: {
                                variant: 'outlined',
                                size: 'small',
                            },
                            columnInputProps: {
                                variant: 'outlined',
                                size: 'small',
                                sx: {mt: 'auto'},
                            },
                            operatorInputProps: {
                                variant: 'outlined',
                                size: 'small',
                                sx: {mt: 'auto'},
                            },
                            valueInputProps: {
                                InputComponentProps: {
                                    variant: 'outlined',
                                    size: 'small',
                                },
                            },
                        },
                    },
                }}
            />
        </>
    );
}