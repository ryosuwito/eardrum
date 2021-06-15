import { Button, Checkbox, FormControl, FormControlLabel, Grid, MenuItem, Paper, TextField, FormHelperText } from '@material-ui/core'
import React, { useContext, useEffect, useState } from 'react'
import { KeyboardDatePicker } from "@material-ui/pickers";
import { makeStyles } from '@material-ui/styles';
import { Link, useHistory } from 'react-router-dom';
import { LeaveContext, useAddLeave } from './hooks';
import moment from 'moment';
import { DATE_FORMAT } from './constants';
import { message } from 'antd';
import { handleError } from './helpers';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '30px',
    },
    textField: {
        width: '100%',
        height: '100%',
    },
    dateField: {
        width: '100%', 
        height: '100%', 
    },
    button: {
        marginRight: '5px',
    },
}));

const LeaveAdd = () => {
    const leaveContext = useContext(LeaveContext);
    
    // The field name and type would not render properly if use useState(null) or useState({})
    const [application, setApplication] = useState({
        user: leaveContext.currentUser.username,
        type: leaveContext.leaveTypes[0].name,
        note: "",
        startdate: new Date(),
        enddate: new Date(),
        half: "00",
        status: "",
    });
    const addLeave = useAddLeave() 
    const [errorDate, setErrorDate] = useState(false);
    const [errorBox, setErrorBox] = useState(false);
    
    let history = useHistory();
    const classes = useStyles();

    const onSubmit = async () => {
        await addLeave.execute({data: application})
        handleError(addLeave, "Error submitting leave request.")
        if (!addLeave.error) {
            message.success("Leave request submitted");
            history.replace("/leave");
        }
    }
    
    useEffect(() => {
        let start = application.startdate
        let end = application.enddate
        let isDateCorrect = moment(end).isSameOrAfter(start) 
                                && (moment(end).year() === moment(start).year());
        setErrorDate(!isDateCorrect);

        let isSameDay = (moment(start).startOf('day').isSame(moment(end).startOf('day')))
        let box = (isSameDay && (application.half[0] === "1") && (application.half[1] === "1"));
        setErrorBox(box)
    }, [application.startdate, application.enddate, application.half])

    return <Paper className={classes.root}>
        <FormControl error={errorBox}>
            <Grid container direction="column" spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Name"
                        onChange={ (event) => {setApplication({...application, user: event.target.value});} }
                        variant='outlined'
                        margin="normal"
                        value={application.user}
                        select
                    >
                        {leaveContext.allUsers.map((item) => (
                            <MenuItem key={item.username} value={item.username}>
                                {item.username}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item container spacing={3} xs={12}>
                    <Grid item xs={6}>
                        <KeyboardDatePicker
                            error={errorDate}
                            helperText={errorDate 
                                && "End date must be in the same year and no sooner than start date."}
                            autoOk
                            variant="inline"
                            inputVariant="outlined"
                            label="Start date"
                            format={DATE_FORMAT.LABEL_DATEFNS}
                            value={application.startdate}
                            onChange={(date) => {
                                setApplication({...application, startdate: date});
                            }}
                            className={classes.dateField}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <KeyboardDatePicker
                            error={errorDate}
                            helperText={errorDate 
                                && "End date must be in the same year and no sooner than start date."}
                            autoOk
                            variant="inline"
                            inputVariant="outlined"
                            label="End date"
                            format={DATE_FORMAT.LABEL_DATEFNS}
                            value={application.enddate}
                            onChange={(date) => {
                                setApplication({...application, enddate: date}); 
                            }}
                            className={classes.dateField}
                        />
                    </Grid>
                </Grid>
                <Grid item container spacing={3} xs={12}>
                    <Grid item xs={6}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={application.half[0] === "1"}
                                    onChange={event => setApplication({
                                        ...application, 
                                        half: Number(event.target.checked).toString() + application.half[1]
                                    })}
                                    color="primary"
                                />
                            }
                            label="Take only the afternoon off on the first leave day"
                        />
                        {errorBox && <FormHelperText>Cannot check both boxes if the two days are the same</FormHelperText>}
                    </Grid>
                    <Grid item xs={6}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={application.half[1] === "1"}
                                    onChange={event => setApplication({
                                        ...application, 
                                        half: application.half[0] + Number(event.target.checked).toString()})}
                                    color="primary"
                                />
                            }
                            label="Take only the morning off on the last leave day"
                        />
                        {errorBox && <FormHelperText>Cannot check both boxes if the two days are the same</FormHelperText>}
                    </Grid>
                </Grid>
                <Grid item>
                    <TextField
                        fullWidth
                        label="Type"
                        onChange={ (event) => setApplication({...application, type: event.target.value}) }
                        variant='outlined'
                        margin="normal"
                        value={ application.type }
                        select
                    >
                        {leaveContext.leaveTypes.map((type) => (
                            <MenuItem key={type.name} value={type.name}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item>
                    <TextField
                        label="Note"
                        onChange={ (event) => setApplication({...application, note: event.target.value}) }
                        placeholder=" "
                        variant='outlined'
                        margin="normal"
                        multiline
                        rows={15}
                        rowsMax={15}
                        value={ application.note || " " }
                        fullWidth
                    />
                </Grid>
            </Grid>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <Button onClick={ onSubmit } color='primary' variant='contained' className={ classes.button } disabled={errorDate || errorBox}>
                    Submit
                </Button>
                <Button to='/leave' component={ Link } color='primary' variant='outlined' className={ classes.button }>Back</Button>
            </div>
        </FormControl>
    </Paper>
}

export default LeaveAdd;
