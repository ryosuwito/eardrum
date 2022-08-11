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
import { useHolidays, useLeaveUsers, useGetCountries } from "./hooks";
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

const LeaveCalendar = ({setCurrentCountry, setCountriesList, refreshCount}) => {
    const [date, setDate] = useState(new Date());
    const [countries, setCountries] = useState([]);
    const [activeCountry, setActiveCountry] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const fetchHoliday = useHolidays();
    const fetchLeaveUsers = useLeaveUsers();
    const fetchCountries = useGetCountries();
    const [fetchLeaveUsersData, setFetchLeaveUsersData] = useState([]);

    const classes = useStyles();

    useEffect(() => {
        const fetchApi = async () => {
            let result = await fetchCountries.execute()
            console.log("GET  COUNTRIES", result)
            setCountries(result.data.countries)
            setCountriesList(result.data.countries)
        }
        fetchApi();
    }, [])

    useEffect(() => {
        const isHoliday = (date) => {
            return fetchHoliday.data.find(item => {
                return moment(item.date).format("YYYYMMDD") === moment(date).format("YYYYMMDD")
            });
        }
        setYear(date.getFullYear());
        if (isHoliday(date)) {
            setFetchLeaveUsersData([{
                group : 'all users',
                users : []
            }])
            console.log("fetchLeaveUsersData", fetchLeaveUsersData)
        } else {
            const fetchApi = async () => {
                console.log("activeCountry", activeCountry)
                let result = await fetchLeaveUsers.execute({date: moment(date).format("YYYYMMDD"), country_code:activeCountry?activeCountry.country_code:null})
                setFetchLeaveUsersData(result.data)
                console.log("result", result)
                handleError(result, "Error fetching leave users.");
            }
            fetchApi();
        }
    }, [date, refreshCount])

    // currently only update holiday of a particular year when user pick any date within the same 
    // year on the calendar. Options: either find a way to detect when user change year view, load
    // all holidays of every years, or remove holiday from this calendar
    useEffect(() => {
        const fetchApi = async () => {
            let result = await fetchHoliday.execute({year: year, country_code:activeCountry?activeCountry.country_code:null})
            handleError(result, "Error fetching holidays.");
        }
        fetchApi();
    }, [year, refreshCount])

    // render holidays differently
    const renderDay = (day, selectedDate, dayInCurrentMonth, dayComponent) => {
        const isHoliday = (day) => {
            return fetchHoliday.data.find(item => {
                return moment(item.date).format("YYYYMMDD") === moment(day).format("YYYYMMDD")
            });
        }
        if (day.getTime() === selectedDate.getTime()) {
            return React.cloneElement(dayComponent, {style: {textDecorationLine: 'underline'}});
        }
        if (isHoliday(day)) {
            return React.cloneElement(dayComponent, {style: {color: "green", textDecorationLine: 'underline'}});
        }
        return dayComponent;
    };
    const changeCountry = (country) => {
        console.log("COUNTRY CLICKED", country)        
        const fetchApi = async () => {
            let result = await fetchHoliday.execute({year: year, country_code:country.country_code});
            handleError(result, "Error fetching holidays.");
            console.log("HOLIDAY CHANGED", result.data)
        }
        fetchApi();
        setActiveCountry(country)
        setCurrentCountry(country)
        setDate(new Date());
    }
    const renderGroup = (item) => {
        if (item.group == 'all users') return true
        for (const user of item.users) {
            if (user.status !== '') return true
        }
        return false
    }
    return (
        <Paper className={classes.root}>
            <Paper>
                <ListSubheader className={classes.list}>
                        Current Calendar : {activeCountry?activeCountry.name:'Singapore'}
                </ListSubheader>
                <List>
                    <Fragment>
                        {countries.map(country => 
                            <Chip onClick={() => changeCountry(country)} label={country.name} className={classes.chips}/>
                        )}
                    </Fragment>
                </List>
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
            {activeCountry?activeCountry.country_code:'SG'} Users on leave ({moment(date).format("DD/MM/YYYY")})
            </ListSubheader>
            {fetchLeaveUsers.loading && <LinearProgress/>}
            <Paper style={{overflow: 'auto'}}>
                <List>
                    {fetchLeaveUsersData.map(item => (
                        <Fragment key={item.group}>
                            <Card style={{display: 'flex', flexWrap: 'wrap'}}>
                                <CardContent style={{padding: 5}}>
                                    <Fragment>
                                        {renderGroup(item) && <Typography variant="h6" className={classes.chips}>{item.group}</Typography>}
                                        {item.users.map(user => 
                                            ((user.status !== '') && <Tooltip title={user.status} key={user.name}>
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
