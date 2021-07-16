import React, { useContext, useEffect } from 'react'
import { Box, Typography, Tooltip,Grid } from '@material-ui/core'
import { DataGrid } from '@material-ui/data-grid';
import { LeaveContext, useStat } from './hooks';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import { handleError } from './helpers';

const LeaveStat = ({year, refreshCount}) => {
    const leaveContext = useContext(LeaveContext);
    const getStat = useStat();

    useEffect(() => {
        const fetchApi = async () => {
            getStat.execute({year: year});
            handleError(getStat, "Error fetching statistics.");
        }

        fetchApi();
    }, [year, refreshCount])

    const columns = [{ 
        field: 'user', 
        headerName: 'User', 
        type: 'string', 
        flex: 0.5, 
    }].concat(leaveContext.leaveTypes.map((item) => ({ 
        field: item.name, 
        renderHeader: (params) => (
            <Grid container direction="row">
                <Typography gutterBottom>{item.label} (max: {item.limitation}d)</Typography>
                <Tooltip title={`Number of ${item.label} leave days ` 
                        + `spent for each user (max: ${item.limitation} days)`} >
                    <HelpOutlineOutlinedIcon style={{marginLeft:5}} fontSize="small"/>
                </Tooltip>
            </Grid>
        ), 
        type: 'string', 
        sortable: false,
        flex: 1, 
        disableColumnMenu: true,
    })))
    
    return <Box m={2}>
        <Typography variant="h5" gutterBottom>Statistic (year {year})</Typography>
         <DataGrid
            autoHeight
            rows={getStat.data}
            columns={columns}
            pagination
            pageSize={10}
            disableSelectionOnClick
            loading={getStat.loading}
        />
    </Box>
}

export default LeaveStat
