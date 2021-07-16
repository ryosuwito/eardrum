import React, { Fragment, useEffect, useState } from "react";
import { DatePicker } from "@material-ui/pickers";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { 
    Card, 
    CardContent, 
    Chip, 
    Divider, 
    LinearProgress, 
    List, 
    ListSubheader, 
    makeStyles, 
    Paper, 
    Tooltip,
    Typography,
} from "@material-ui/core";
import { useHolidays, useLeaveUsers } from "./hooks";
import moment from "moment";
import { handleError } from "./helpers";

const useStyles = makeStyles(theme => ({
    root: {
        justifyContent: 'space-between',
    },
    list: {
        backgroundColor: theme.palette.primary.main,
        color: "white",
    },
    chips: {
        margin: theme.spacing(0.5)
    }
}))

const LeaveCalendar = ({refreshCount}) => {
    const [date, setDate] = useState(new Date());
    const [year, setYear] = useState(new Date().getFullYear());
    const fetchHoliday = useHolidays();
    const fetchLeaveUsers = useLeaveUsers();

    const classes = useStyles();

    useEffect(() => {
        setYear(date.getFullYear());
        const fetchApi = async () => {
            await fetchLeaveUsers.execute({date: moment(date).format("YYYYMMDD")})
            handleError(fetchLeaveUsers, "Error fetching leave users.");
        }
        fetchApi();
    }, [date, refreshCount])

    // currently only update holiday of a particular year when user pick any date within the same 
    // year on the calendar. Options: either find a way to detect when user change year view, load
    // all holidays of every years, or remove holiday from this calendar
    useEffect(() => {
        const fetchApi = async () => {
            await fetchHoliday.execute({year: year});
            handleError(fetchHoliday, "Error fetching holidays.");
        }
        fetchApi();
    }, [year, refreshCount])

    // render holidays differently
    const renderDay = (day, selectedDate, dayInCurrentMonth, dayComponent) => { 
        const isHoliday = (day) => {
            return fetchHoliday.data.find(item => {return item.date.getTime() === day.getTime()});
        }
        if (day.getTime() === selectedDate.getTime()) {
            return React.cloneElement(dayComponent, {style: {textDecorationLine: 'underline'}});
        }
        if (isHoliday(day)) {
            return React.cloneElement(dayComponent, {style: {color: "green", textDecorationLine: 'underline'}});
        }
        return dayComponent;
    };

    return (
        <Paper className={classes.root}>
            <Paper>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <DatePicker
                        autoOk
                        orientation="portrait"
                        variant="static"
                        openTo="date"
                        value={date}
                        renderDay={renderDay}
                        onChange={setDate}
                    />
                </MuiPickersUtilsProvider>
            </Paper>
            <Divider/>
            <ListSubheader className={classes.list}>
                Users on leave ({moment(date).format("DD/MM/YYYY")})
            </ListSubheader>
            {fetchLeaveUsers.loading && <LinearProgress/>}
            <Paper style={{overflow: 'auto'}}>
                <List>
                    {fetchLeaveUsers.data.map(item => (
                        <Fragment>
                            <Card style={{display: 'flex', flexWrap: 'wrap'}}>
                                <CardContent style={{padding: 5}}>
                                    <Fragment>
                                        <Typography variant="h6" className={classes.chips}>{item.group}</Typography>
                                        {item.users.map(user => 
                                            ((user.status !== '') && <Tooltip title={user.status} >
                                                <Chip label={user.name} className={classes.chips}/>
                                            </Tooltip>)
                                        )}
                                    </Fragment>
                                </CardContent>
                            </Card>
                            <Divider/>
                        </Fragment>
                    ))}
                </List>
            </Paper>
        </Paper>
    );
};

export default LeaveCalendar;
