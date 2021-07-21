import React, { useContext, useEffect, useState } from 'react'
import { Box, Typography, Tooltip, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem } from '@material-ui/core'
import Grid from '@material-ui/core/Grid'
import { DataGrid } from '@material-ui/data-grid';
import { LeaveContext, useGetCapacities, usePostCapacities, useStat } from './hooks';
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import { handleError } from './helpers';
import { Fragment } from 'react';

const LeaveStat = ({year, refreshCount}) => {
    const leaveContext = useContext(LeaveContext);
    const getStat = useStat();
    const [openCapDialog, setOpenCapDialog] = useState(false);
    const getCapacities = useGetCapacities();
    const postCapacities = usePostCapacities();
    const [localRefreshCount, setLocalRefreshCount] = useState(0)
    const [statWithCap, setStatWithCap] = useState([])
    const [editCapUser, setEditCapUser] = useState(leaveContext.currentUser.username)
    const [editCapType, setEditCapType] = useState(leaveContext.leaveTypes[0].name)
    const [editCapLimit, setEditCapLimit] = useState("0")

    useEffect(() => {
        const fetchApi = async () => {
            let result = getStat.execute({year: year});
            handleError(result, "Error fetching statistics.");
        }

        fetchApi();
    }, [year, refreshCount])

    useEffect(() => {
        const fetchApi = async () => {
            let result = await getCapacities.execute({year: year})
            handleError(result, "Error fetching leave capacities");
        }

        fetchApi();
    }, [year, localRefreshCount])

    useEffect(() => {
        if (JSON.stringify(getCapacities.data[1]) !== '{}' && getStat.data) {
            let arr = JSON.parse(JSON.stringify(getStat.data))
            arr.forEach(obj => {
                leaveContext.leaveTypes.forEach(item => {
                    obj[item.name] = obj[item.name] + '/' + getCapacities.data[1][obj.user][item.name]
                })
            })
            setStatWithCap(arr)
        }
    }, [getCapacities.data, getStat.data])

    const statisticsColumns = [{ 
        field: 'user', 
        headerName: 'User', 
        type: 'string', 
        flex: 0.5, 
    }].concat(leaveContext.leaveTypes.map((item) => ({ 
        field: item.name, 
        renderHeader: (params) => (
            <Grid container direction="row">
                <Typography gutterBottom>{item.label}</Typography>
                <Tooltip title={`Number of ${item.label} leave days ` 
                        + `spent for each user/Maximum number of ${item.label} leave days for that user`} >
                    <HelpOutlineOutlinedIcon style={{marginLeft:5}} fontSize="small"/>
                </Tooltip>
            </Grid>
        ), 
        type: 'string', 
        sortable: false,
        flex: 1, 
        disableColumnMenu: true,
    })))

    const onSubmit = async () => {
        setOpenCapDialog(false)
        let result = await postCapacities.execute({year: year, user: editCapUser, typ: editCapType, limit: Number(editCapLimit)})
        handleError(result, "Error updating leave capacities", "Leave capacities updated successfully")
        setLocalRefreshCount(count => count + 1)
    }

    const onCancel = () => {
        setOpenCapDialog(false)
    }
    
    return <Box m={2}>
        <Grid container direction="row" justify='space-between'>
            <Grid item>
                <Typography variant="h5" gutterBottom>Statistic (year {year})</Typography>
            </Grid>
            {leaveContext.currentUser.is_admin && <Grid item>
                <Button variant="outlined" onClick={() => setOpenCapDialog(true)}>Edit leave capacity</Button>
            </Grid>}
        </Grid>
         <DataGrid
            autoHeight
            rows={statWithCap}
            columns={statisticsColumns}
            pagination
            pageSize={10}
            disableSelectionOnClick
            loading={getStat.loading}
        />
       {leaveContext.currentUser.is_admin && <Dialog open={openCapDialog} onClose={() => setOpenCapDialog(false)}>
            <DialogTitle>Edit leave capacity</DialogTitle>
            <DialogContent>
                <TextField
                    fullWidth
                    label="Name"
                    variant='outlined'
                    margin="normal"
                    value={editCapUser}
                    onChange={(event) => {setEditCapUser(event.target.value)}}
                    select
                >
                    {leaveContext.allUsers.map((item) => (
                        <MenuItem key={item.username} value={item.username}>
                            {item.username}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    fullWidth
                    label="Type"
                    variant='outlined'
                    margin="normal"
                    value={ editCapType }
                    onChange={(event) => {setEditCapType(event.target.value)}}
                    select
                >
                    {leaveContext.leaveTypes.map((type) => (
                        <MenuItem key={type.name} value={type.name}>
                            {type.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    fullWidth
                    label="Days"
                    variant='outlined'
                    margin="normal"
                    type='number'
                    value={ editCapLimit }
                    onChange={(event) => {setEditCapLimit(event.target.value)}}
                />
            </DialogContent>
            <DialogActions>
                {leaveContext.currentUser.is_admin 
                    ?   <Fragment>
                            <Button onClick={onSubmit} color="primary">
                                Submit
                            </Button>
                            <Button onClick={onCancel} color="primary" autoFocus>
                                Cancel
                            </Button>
                        </Fragment>
                    :   <Button onClick={() => setOpenCapDialog(false)} color="primary">
                            Back
                        </Button>}
            </DialogActions>
        </Dialog>}
    </Box>
}

export default LeaveStat
