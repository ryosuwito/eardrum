import React, { useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button, DialogTitle, Table, TableRow, TableCell, Chip, TextField } from '@material-ui/core';
import { STATUS_TYPES } from '../constants';

export default ({ content, onConfirm, open, setOpen, title, isReject = false, setNewNote}) => {
    const [reason, setReason] = useState("")

    let item = JSON.stringify(content) === "{}" ? {} : ({
        'User': content['user'],
        'Half day leave on the first day': content['half'][0] === "0" ? "No" : "Yes",
        'Half day leave on the last day': content['half'][1] === "0" ? "No" : "Yes",
        'Start date': content['startdate'],
        'End date': content['enddate'],
        'Type': <Chip label={content['type']} variant="outlined"/>,
        'Status': <Chip 
                    label={content['status']} 
                    color={content['status'] === STATUS_TYPES.PENDING ? "default" : "primary"}
                    variant={content['status'] === STATUS_TYPES.REJECTED ? "outlined" : "default"}/>,
        'Note': content['note'].split('\n').map((line, index) => <div key={index}>{line}</div>),
    })
    return (
        <Dialog
            open={open}
            onClose={() => setOpen(false)}
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <Table>
                        <tbody> 
                        {/*https://stackoverflow.com/questions/39915629/validatedomnesting-tr-cannot-appear-as-a-child-of-div*/}
                            {Object.entries(item).map(([key, value]) => 
                                <TableRow key={key}>
                                    <TableCell>
                                        {key}
                                    </TableCell>
                                    <TableCell>
                                        {value}
                                    </TableCell>
                                </TableRow>
                            )}
                            {isReject && <TableRow>
                                <TableCell>Rejection reason</TableCell>
                                <TableCell>
                                    <TextField
                                        onChange={ (event) => {
                                            setReason(event.target.value); 
                                            setNewNote(content['note'] + '\n===Rejecting reason===\n' + event.target.value);
                                        } }
                                        value={reason}
                                        placeholder=" "
                                        variant='outlined'
                                        margin="normal"
                                        multiline
                                        rows={5}
                                        rowsMax={5}
                                        fullWidth
                                    />
                                </TableCell>
                            </TableRow>}
                        </tbody>
                    </Table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={ () => {onConfirm(); setOpen(false); }} color="primary">
                        Yes
                    </Button>
                    <Button onClick={() => setOpen(false)} color="primary" autoFocus>
                        No
                    </Button>
            </DialogActions>
        </Dialog> 
)}
