import React, { useEffect, useState, Fragment, useContext } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import { Box, Button, Typography, Chip } from '@material-ui/core';
import { useDeleteLeave, useGetLeaveAll, useUpdateLeave, LeaveContext  } from './hooks';
import { message } from 'antd';
import CustomPopover from './components/CustomPopover.js';
import ConfirmDialog from './components/ConfirmDialog';
import { STATUS_TYPES } from './constants';
import { handleError } from './helpers';

const LeavePending = ({refresh, refreshCount}) => {
  const updateLeave = useUpdateLeave();
  const deleteLeave = useDeleteLeave();
  const [leaveId, setLeaveId] = useState(0);
  const leaveContext = useContext(LeaveContext);
  const getLeaveAll = useGetLeaveAll(leaveContext);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState({})
  const [dialogContent, setDialogContent] = useState({})

  useEffect(() => {
    const fetchApi = async () => {
      await getLeaveAll.execute({status: STATUS_TYPES.PENDING});
      handleError(getLeaveAll, "Error fetching leave requests.");
    }
    fetchApi();
  }, [refreshCount])

  const APPROVE = "approve";
  const REJECT = "reject";
  const DELETE = "delete";

  const onAction = (item, mode) => {
    setLeaveId(item.id);
    switch (mode) {
      case APPROVE:
        setOpenApproveDialog(true);
        setDialogTitle("Approve this leave request?");
        setDialogContent(item);
        return;
      case REJECT:
        setOpenRejectDialog(true);
        setDialogTitle("Reject this leave request?");
        setDialogContent(item);
        return;
      case DELETE:
        setOpenDeleteDialog(true);
        setDialogTitle("Delete this leave request?");
        setDialogContent(item);
        return;
      default:
        message.error("Something went wrong");
        console.error("Unexpected action: " + mode);
    }
  }

  const onActionConfirm = async (id, mode) => {
    switch (mode) {
      case APPROVE:
        await updateLeave.execute({id: id, data: {status: STATUS_TYPES.APPROVED}});
        handleError(updateLeave, "Something went wrong", "Leave request approved");
        break;
      case REJECT:
        await updateLeave.execute({id: id, data: {status: STATUS_TYPES.REJECTED}});
        handleError(updateLeave, "Something went wrong", "Leave request rejected");
        break;
      case DELETE:
        await deleteLeave.execute({id: id});
        handleError(deleteLeave, "Something went wrong", "Leave request deleted");
        break;
      default:
        message.error("Something went wrong");
        console.error("Unexpected action: " + mode);
    }
    refresh();
  }

  const renderNoteCell = (params) => (
    params.row.note === "" 
      ? <div style={{padding:10}}>-</div> 
      : <CustomPopover label="View" text={params.row.note}/>
  )

  const renderActionButtons = (params) => (
    <Fragment>
      {leaveContext.currentUser.is_admin 
        && <Button color='primary' style={{margin: 5}} onClick={() => onAction(params.row, APPROVE)}>
          Approve
      </Button>}
      {leaveContext.currentUser.is_admin 
        && <Button color='primary' style={{margin: 5}} onClick={() => onAction(params.row, REJECT)}>
          Reject
      </Button>}
      <Button color='primary' style={{margin: 5}} onClick={() => onAction(params.row, DELETE)}>
          Delete
      </Button>
    </Fragment>
  )

  const renderStatusCell = (params) => (
    <Chip label={params.value}/>
  )

  const renderTypeCell = (params) => (
    <Chip label={params.value} variant="outlined"/>
  )

  const columns = [
    { field: 'user', headerName: 'User', type: 'string', flex: 1, },
    { field: 'startdate', headerName: 'Start date', type: 'string', flex: 1, },
    { field: 'enddate', headerName: 'End date', type: 'string', flex: 1, },
    { field: 'type', headerName: 'Type', type: 'string', flex: 1, sortable: false, renderCell: renderTypeCell, },
    { field: 'beautified_half', headerName: 'Half-day leave', type: 'string', flex: 1, 
      description: "Whether the leave request apply for half-day leave on the first and last day, respectively", sortable: false,
      valueGetter: (params) => params.getValue(params.id, "half").replace(/[01]/g, (m) => ({
        '0': '[ False ]',
        '1': '[ True ]'
      }[m]))} ,
    { field: 'note', headerName: 'Note', type: 'string', flex: 1,
      renderCell: renderNoteCell, sortable: false, },
    { field: 'status', headerName: 'Status', type: 'string', flex: 1, sortable: false, 
      renderCell: renderStatusCell, },
    { field: 'action', headerName: 'Action', disableColumnMenu: true, sortable: false, 
      renderCell: renderActionButtons , width: (leaveContext.currentUser.is_admin) * 200 + 100},
  ];

  return (
    <Box m={2}>
        <Typography variant="h5" gutterBottom>Pending requests</Typography>
        <DataGrid
            autoHeight 
            rows={getLeaveAll.data} 
            columns={columns}
            pagination
            pageSize={10}
            disableSelectionOnClick 
            loading={getLeaveAll.loading}
        />
        <ConfirmDialog 
          onConfirm={() => onActionConfirm(leaveId, APPROVE)} 
          open={openApproveDialog} 
          setOpen={setOpenApproveDialog}
          content={dialogContent}
          title={dialogTitle}
        /> 
        <ConfirmDialog 
          onConfirm={() => onActionConfirm(leaveId, REJECT)} 
          open={openRejectDialog} 
          setOpen={setOpenRejectDialog}
          content={dialogContent}
          title={dialogTitle}
        /> 
        <ConfirmDialog 
          onConfirm={() => onActionConfirm(leaveId, DELETE)} 
          open={openDeleteDialog} 
          setOpen={setOpenDeleteDialog}
          content={dialogContent}
          title={dialogTitle}
        /> 
    </Box>
  );
}

export default LeavePending;
