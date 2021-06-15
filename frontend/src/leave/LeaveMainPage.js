import { Box, Button, Grid, makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import {
  Link,
} from "react-router-dom";

import LeaveCalendar from './LeaveCalendar';
import LeaveStat from './LeaveStat';
import LeavePending from './LeavePending';
import LeaveResolved from './LeaveResolved';
import { DatePicker } from "@material-ui/pickers";
import LeaveHoliday from './LeaveHoliday';

// Note: makeStyles must be imported from @material-ui/core to use theme.spacing or theme.breakpoints
// TODO: refactor layout in src/App.js
const useStyles = makeStyles(theme => ({
  root: {
    width: 'auto',
    [theme.breakpoints.up(1750)]: {
      width: "175%",
      transform: 'translate(-21.42857%, 0)',
    },
    // (150% - 100%)/(2 * 150%) = 16.66667%
    [theme.breakpoints.between(1500, 1750)]: {
      width: "150%",
      transform: 'translate(-16.66667%, 0)',
    },
    // (125% - 100%)/(2 * 125%) = 10%
    [theme.breakpoints.between(1250, 1500)]: {
      width: "125%",
      transform: 'translate(-10%, 0)',
    },
    paddingTop: theme.spacing(2), 
    paddingBottom: theme.spacing(10),
  },
}))

const LeaveMainPage = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [date, setDate] = useState(new Date());
  const [refreshCount, setRefreshCount] = useState(0);
  const classes = useStyles();

  const refresh = () => {
    setRefreshCount(refreshCount => refreshCount + 1)
  };

  return (
    <div className={classes.root}>
        {<Grid container spacing={5}>
            <Grid item xs={12} style={{ textAlign: 'end'}}>
                <Button to='/leave/new' color="primary" variant="contained" component={ Link }>New</Button>
            </Grid>
            <Grid item style={{maxWidth: "350px"}}>
                <LeaveCalendar refreshCount={refreshCount}/>
                <LeaveHoliday refresh={refresh}/>
            </Grid>
            <Grid item style={{flexGrow: 1}}>
                <LeavePending refresh={refresh} refreshCount={refreshCount}/>
                <Box mt={10}>
                  <DatePicker
                      views={["year"]}
                      label="View data in: "
                      value={date}
                      onChange={setDate}
                      style={{width: '100%'}}
                      onYearChange={(date) => setYear(date.getFullYear())}
                      autoOk
                    />
                  <LeaveStat year={year} refreshCount={refreshCount}/>
                  <LeaveResolved year={year} refreshCount={refreshCount} refresh={refresh}/>
                </Box>
            </Grid>
        </Grid>}
    </div>
  )
}

export default LeaveMainPage;
