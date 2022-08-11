import React, { Fragment, useContext, useEffect, useState } from "react";
import { DatePicker } from "@material-ui/pickers";
import { 
    Box,
    Button,
    Divider, 
    Grid, 
    LinearProgress, 
    List, 
    ListItem, 
    ListItemSecondaryAction, 
    ListItemText, 
    ListSubheader, 
    makeStyles, 
    Paper, 
    TextField, 
    Select,
    FormControl,
    InputLabel,
    MenuItem,
} from "@material-ui/core";
import { LeaveContext, useHolidays, usePatchHolidays, useRecalculateMasks } from "./hooks";
import moment from "moment";
import { DATE_FORMAT } from "./constants";
import { handleError, holidayComparator } from "./helpers";
import { borderBottom } from "@material-ui/system";

const useStyles = makeStyles(theme => ({
    root: {
        justifyContent: 'space-between',
    },
    list: {
        backgroundColor: theme.palette.primary.main,
        color: "white",
    },
    yearInput: {
        padding: theme.spacing(2)
    }
}))

const LeaveHoliday = ({refresh, country, countries_list}) => {
    const [year, setYear] = useState(new Date().getFullYear());
    const fetchHolidays = useHolidays();
    const [isEditHoliday, setIsEditHoliday] = useState(false);
    const [holiday, setHoliday] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const recalculateMasks = useRecalculateMasks();
    const [holidays, setHolidays] = useState([]);
    const patchHolidays = usePatchHolidays();
    const leaveContext = useContext(LeaveContext);

    const classes = useStyles();

    useEffect(() => {
        console.log("UPDATED COUNTRY HOLIDAY",country)
        const fetchApi = async () => {
            let result = await fetchHolidays.execute({year: year, country_code:country});
            handleError(result, "Error fetching holidays.");
        }
        fetchApi();
    }, [year, country])

    useEffect(() => {
        if (fetchHolidays.data) {
            // shallow copy
            setHolidays(fetchHolidays.data.slice())
        }
    }, [fetchHolidays.data])

    const handleDeleteHoliday = (holiday) => {
        setHolidays(holidays => holidays.filter(item => item.date !== holiday))
    }

    const handleAddHoliday = (holiday) => {
        setHolidays(holidays => {
            let holiday_id = moment(holiday).format(DATE_FORMAT.VALUE)
            let holiday_date = moment(holiday).startOf('day').toDate();
            if (holidays.map(holiday => holiday.id).includes(holiday_id)) return holidays;
            let new_holidays = holidays.concat([{id: holiday_id, date: holiday_date}])
            new_holidays.sort(holidayComparator);
            return new_holidays;
        });
    }

    const onDoneEdit = async () => {
        if (isEditHoliday) {
            let result = await patchHolidays.execute({year: year, holidays: holidays, country:selectedCountry});
            handleError(result, "Error updating holidays");
            if (!result.error && isEditHoliday) {
                let result = await recalculateMasks.execute({year: year});
                handleError(result, "Error updating statistics", "Statistics updated");
                refresh();
            }
            setSelectedCountry(null)
        }
        setIsEditHoliday(edit => !edit)
    }

    const handleChangeSelectedCountry = async (e) => {
        console.log(e.target.value)
        setSelectedCountry(e.target.value)
    }

    return (
        <Paper className={classes.root}>
            <ListSubheader className={classes.list}>
                {country?country:'SG'} Holidays
                {leaveContext.currentUser.is_admin && <ListItemSecondaryAction>
                    <Button variant="contained" onClick={onDoneEdit}>
                        {isEditHoliday ? "Done" : "Edit"}
                    </Button>
                </ListItemSecondaryAction>}
            </ListSubheader>
            {fetchHolidays.loading && <LinearProgress/>}
            <Paper>
                <div className={classes.yearInput}>
                    <TextField 
                        label="Year" 
                        type="number" 
                        disabled={isEditHoliday}
                        defaultValue={year} 
                        fullWidth
                        onChange={(event) => setYear(event.target.value)}
                    />
                </div>
                <List>
                    {leaveContext.currentUser.is_admin && isEditHoliday && <Box ml={1}>
                        <Grid container direction="row" alignItems="center">
                            <Grid item xs={8}>
                                <div style={{marginBottom:"15px"}}>
                                    <FormControl fullWidth>
                                        <InputLabel id="selectedCountry-label">Country</InputLabel>
                                            <Select
                                                labelId="selectedCountry-label"
                                                id="selectedCountry"
                                                value={selectedCountry}
                                                label="Country"
                                                onChange={handleChangeSelectedCountry}
                                            >
                                            {countries_list.map(country => (
                                                <MenuItem value={country.country_code}>{country.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </div>
                                <div style={{marginBottom:"15px"}}>
                                    <DatePicker
                                        disableToolbar
                                        autoOk
                                        label="Add holiday"
                                        variant="inline"
                                        inputVariant="outlined"
                                        format={DATE_FORMAT.LABEL_DATEFNS}
                                        value={holiday}
                                        onChange={(date) => setHoliday(date)}
                                        minDate={new Date(Number(year), 0, 1)}
                                        maxDate={new Date(Number(year), 11, 31)}
                                    />
                                </div>
                            </Grid>
                            <Grid item container direction="column" xs={4}>
                                <Button onClick={() => { 
                                    if (holiday === null) return;
                                    handleAddHoliday(holiday)
                                    setHoliday(null);
                                }}>Add</Button>
                                <Button onClick={() => setHoliday(null)}>Clear</Button>
                            </Grid>
                        </Grid>
                    </Box>}
                    <Divider/>
                    {holidays.map(item => 
                        (<Fragment key={item.id}>
                            <ListItem>
                                <ListItemText 
                                    primary={moment(item.date).format(DATE_FORMAT.LABEL)} 
                                    secondary={
                                        moment(item.date).diff(moment().startOf('day'), 'days') < 0 
                                            ? "Passed"
                                            : `${moment(item.date).diff(moment().startOf('day'), 'days')} day(s) left`
                                    } />
                                {leaveContext.currentUser.is_admin && isEditHoliday && <ListItemSecondaryAction>
                                    <Button 
                                        onClick={() => {
                                            handleDeleteHoliday(item.date)
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </ListItemSecondaryAction>}
                            </ListItem>
                            <Divider/>
                        </Fragment>)
                    )}
                </List>
            </Paper>
        </Paper>
    );
};

export default LeaveHoliday;
