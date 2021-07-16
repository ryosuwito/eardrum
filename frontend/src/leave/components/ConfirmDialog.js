import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, DialogTitle, Table, TableRow, TableCell } from '@material-ui/core';

export default ({ content, onConfirm, open, setOpen, title }) => {
    let item = {}
    Object.entries(content).forEach(([key, value]) => {
        switch(key) {
            case 'id':
                break;
            case 'half':
                item['Half day leave on the first day'] = value[0] === 0 ? "No" : "Yes"
                item['Half day leave on the last day'] = value[1] === 0 ? "No" : "Yes"
                break;
            case 'startdate':
                item['Start date'] = value
                break;
            case 'enddate':
                item['End date'] = value;
                break;
            default:
                let capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                item[capitalizedKey.replace('_', ' ')] = value;
        }
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
                    {/*TODO: use table*/}
                        {Object.entries(item).map(([key, value]) => 
                            <TableRow>
                                <TableCell>
                                    {key}
                                </TableCell>
                                <TableCell>
                                    {value.split('\n').map(line => <div>{line}</div>)}
                                </TableCell>
                            </TableRow>
                        )}
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
