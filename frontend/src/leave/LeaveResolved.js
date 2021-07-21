import React, { useContext, useEffect, useState } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Typography, Button, Chip } from '@material-ui/core';
import { LeaveContext, useGetLeaveAll, useDeleteLeave  } from './hooks';
import CustomPopover from './components/CustomPopover.js';
import ConfirmDialog from './components/ConfirmDialog';
import { STATUS_TYPES } from './constants';
import { handleError } from './helpers';

const LeaveResolved = ({year, refreshCount, refresh}) => {
  const [resolvedRequests, setResolvedRequests] = useState([]);
  const deleteLeave = useDeleteLeave();
  const [leaveId, setLeaveId] = useState(0);
  const leaveContext = useContext(LeaveContext);
  const getLeaveAll = useGetLeaveAll(leaveContext);
  const [dialogContent, setDialogContent] = useState({})
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    const fetchApi = async () => {
      let result = await getLeaveAll.execute({year: year});
      handleError(result, "Error fetching resolved leave requests.");
    }
    fetchApi();
  }, [refreshCount, year])

  //TODO: separate useGetLeaveAll to useGetLeavePending and useGetLeaveResolved
  useEffect(() => {
    if (getLeaveAll.data) {
      setResolvedRequests(getLeaveAll.data.filter(item => item.status !== "pending"));
    }
  }, [getLeaveAll.data])

  const onDelete = (item) => {
    setLeaveId(item.id);
    setDialogContent(item)
    setOpenDeleteDialog(true);
  }

  const onDeleteConfirm = async (id) => {
    let result = await deleteLeave.execute({id: id});
    handleError(result, "Something went wrong", "Leave request deleted");
    refresh();
  }

  const renderActionButton = (params) => (
    <Button color='primary' style={{margin: 5}} onClick={() => onDelete(params.row)}>
        Delete
    </Button>
  )

  const renderNoteCell = (params) => (
    params.row.note === "" ? <div style={{padding:10}}>-</div> : 
    <CustomPopover label="View" text={params.row.note}/>
  )

  const renderStatusCell = (params) => (
    <Chip 
      label={params.value} 
      color="primary"
      variant={params.value === STATUS_TYPES.REJECTED ? "outlined" : "default"}/>
  )

  const renderTypeCell = (params) => (
    <Chip label={params.value} variant="outlined"/>
  )

  //https://github.com/mui-org/material-ui-x/issues/898
  const renderHeader = (params) => (
    <div style={{wrapText: true, overflow: "hidden", lineHeight: "20px", whiteSpace: "normal"}}>{params.colDef.headerName}</div>
  )

  const renderDate = (params) => (
    <div>
      {params.value[0]} 
      {(params.value[1] === "1") && <Chip label="half"/>}
    </div>
  )

  const columns = [
    { field: 'user', headerName: 'User', type: 'string', flex: 1, },
    { field: 'start_date', headerName: 'Start date', type: 'string', flex: 1, filterable: false, 
      valueGetter: (params) => [params.row.startdate, params.row.half[0]],
      renderCell: renderDate, },
    { field: 'end_date', headerName: 'End date', type: 'string', flex: 1, filterable: false, 
      valueGetter: (params) => [params.row.enddate, params.row.half[1]],
      renderCell: renderDate, },
    { field: 'type', headerName: 'Type', type: 'string', flex: 1, sortable: false, renderCell: renderTypeCell },
    { field: 'note', headerName: 'Note', type: 'string', flex: 1,
    renderCell: renderNoteCell, sortable: false, filterable: false, },
    { field: 'status', headerName: 'Status', type: 'string', flex: 1, sortable: false, renderCell: renderStatusCell },
    { field: 'action', headerName: 'Action', disableColumnMenu: true, sortable: false, 
      renderCell: renderActionButton , width: 100, hide: !leaveContext.currentUser.is_admin, },
  ].map(obj => ({...obj, renderHeader: renderHeader}));;

  return (
    <Box m={2}>
        <Typography variant="h5" gutterBottom>Resolved requests (year {year})</Typography>
        <DataGrid
            autoHeight 
            rows={resolvedRequests} 
            columns={columns}
            pagination
            pageSize={10}
            disableSelectionOnClick 
            loading={getLeaveAll.loading}
        />
        <ConfirmDialog 
          onConfirm={() => onDeleteConfirm(leaveId)} 
          open={openDeleteDialog} 
          setOpen={setOpenDeleteDialog}
          title="Delete this leave request?"
          content={dialogContent}
        /> 
    </Box>
  );
}

export default LeaveResolved;
