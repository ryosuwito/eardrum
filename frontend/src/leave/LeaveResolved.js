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
      await getLeaveAll.execute({year: year});
      handleError(getLeaveAll, "Error fetching leave requests.");
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
    await deleteLeave.execute({id: id});
    handleError(deleteLeave, "Something went wrong", "Leave request deleted");
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

  const columns = [
    { field: 'user', headerName: 'User', type: 'string', flex: 1, },
    { field: 'startdate', headerName: 'Start date', type: 'string', flex: 1, },
    { field: 'enddate', headerName: 'End date', type: 'string', flex: 1, },
    { field: 'type', headerName: 'Type', type: 'string', flex: 1, sortable: false, renderCell: renderTypeCell },
    { field: 'beautified_half', headerName: 'Half-day leave', type: 'string', flex: 1, 
      description: "Whether the leave request apply for half-day leave on the first and last day, respectively", sortable: false,
      valueGetter: (params) => params.getValue(params.id, "half").replace(/[01]/g, (m) => ({
        '0': '[ False ]',
        '1': '[ True ]'
      }[m])), },
    { field: 'note', headerName: 'Note', type: 'string', flex: 1,
    renderCell: renderNoteCell, sortable: false },
    { field: 'status', headerName: 'Status', type: 'string', flex: 1, sortable: false, renderCell: renderStatusCell },
    { field: 'action', headerName: 'Action', disableColumnMenu: true, sortable: false, 
      renderCell: renderActionButton , width: 100, hide: !leaveContext.currentUser.is_admin, },
  ];

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
