import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import {
  Grid,
  TableHeaderRow,
  TableRowDetail,
  TableFilterRow,
  Table,
} from '@devexpress/dx-react-grid-material-ui';
import {
  RowDetailState,
  FilteringState,
  SortingState,
  IntegratedFiltering,
  IntegratedSorting,
} from '@devexpress/dx-react-grid';
import {
  okrFetchAll,
  onCreateOKR
} from './actions';
import { enqueueSnackbar } from '../actions';
import WithLongPolling from '../core/WithLongPolling';


const columns = [
  // { name: 'id', title: 'Id' },
  { name: 'id', title: 'ID' },
  { name: 'issuer', title: 'Issuer' },
  { name: 'quarter', title: 'Quarter' },
  { name: 'year', title: 'Year' },
  // { name: 'content', title: 'Content' },
]

// const datetimeColumns = ['close_at'];


const sortingStateColumnExtensions = [
  { columnName: 'id', sortingEnabled: false },
  { columnName: 'issuer', sortingEnabled: false },
  { columnName: 'quarter', sortingEnabled: false },
  { columnName: 'year', sortingEnabled: false },
]

function SimpleDialog(props) {
  const { open, onClose, okr } = props;

  const handleChange = (name) => event => {
    okr[name] = event.target.value;
  }

  const getOKRValue = (name) => {
    return okr[name];
  }
  return (
    <Dialog onClose={onClose(false)} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle>Create New OKR</DialogTitle>
      <DialogContent>
        <FormControl variant="outlined" style={{ marginTop: '10px', width:'100%'}}>
          <InputLabel htmlFor="grade-label-placeholder-id">
            Quarter
          </InputLabel>
          <Select
            native
            defaultValue={getOKRValue('quarter')}
            onChange={handleChange('quarter')}
            input={<OutlinedInput labelWidth={45}
              name="quarter" id="grade-label-placeholder-id" />}
          >
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
          </Select>
        </FormControl>

        <FormControl variant="outlined" style={{ marginTop: '10px', width:'100%'}}>
          <TextField
            label="Year"
            type="number"
            defaultValue={getOKRValue('year')}
            onChange={handleChange('year')}
            variant='outlined'
            margin="normal"
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose(false)} color='default' variant='contained'>No</Button>
        <Button onClick={onClose(true, okr)} color='primary' variant='contained'>Yes</Button>
      </DialogActions>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};


class OKRList extends Component {
  constructor(props) {
    super(props);
    const defaultOKR = {};
    const now = new Date();
    defaultOKR.quarter = Math.floor(now.getMonth() / 3) + 1;
    defaultOKR.year = now.getFullYear();
    this.state = {
      okrContentState: 'write',
      okr: defaultOKR,
      dialogOpen: false,
    }
  }

  onSaveForm = async (okr) => {
    try {
        const isSucceeded = await (await onCreateOKR(okr))(this.props.dispatch);
        if (isSucceeded) {
          this.props.history.push('/okrs/'+this.props.okr.id)
        }
    } catch (err) {
      this.props.dispatch(enqueueSnackbar({
        message: err.message,
        options: {
          variant: 'error',
        }
      }))
    }
  }

  onCloseDialog = (answer = false, okr=null) => async () => {
    if (answer) {
      console.log("new OKR :", okr)
      this.onSaveForm(okr)
      this.setState({ dialogOpen: false })
    } else {
      this.setState({ dialogOpen: false })
    }
  }
  opendialog = () => {
    this.setState({ dialogOpen: true })
  }
  render() {
    const RowDetail = ({ row }) => {
      return (
        <React.Fragment>
          <Typography component='div' dangerouslySetInnerHTML={{ __html: row.html_content }} />
          {row.files &&
            <div>{row.files.map(function (object, i) {
              return <a href={object.file} target="_blank" ><div>{object.name}</div></a>;
            })
            }</div>}
          <div style={{ textAlign: 'end', marginBottom: '10px' }}>
            <Button color='primary' to={`/okrs/${row.id}`}
              component={Link} variant='outlined'>View and Edit</Button>{' '}
          </div>
        </React.Fragment>)
    }
    return (
      <div style={{ marginTop: '20px' }}>
        <div style={{ textAlign: 'end', marginBottom: '10px' }}>
          <Button onClick={this.opendialog} color="primary" variant="contained" >New</Button>
        </div>
        <Paper>
          <SimpleDialog open={this.state.dialogOpen} onClose={this.onCloseDialog} okr={this.state.okr} />
          <Grid
            rows={this.props.okrs}
            columns={columns}>
            <FilteringState />
            <SortingState columnExtensions={sortingStateColumnExtensions} />
            {/* <DatetimeTypeProvider for={ datetimeColumns } /> */}
            <IntegratedFiltering />
            <IntegratedSorting />
            <RowDetailState />
            <Table />
            <TableHeaderRow showSortingControls />
            <TableRowDetail contentComponent={RowDetail} />
            <TableFilterRow showFilterSelector />
          </Grid>
        </Paper>
      </div>
    )
  }
}

OKRList.propTypes = {
  okrs: PropTypes.array.isRequired,
}


const mapStateToProps = (state, props) => {
  console.log("mapStateToPropsSS", state)
  console.log("mapStateToProps", props)
  return ({
    okr: _.cloneDeep(state.okr),
    okrs: _.cloneDeep(Object.values(state.okrs)),
  })
}


const mapDispatchToProps = dispatch => ({
  dispatch: dispatch,
})

const pollingJobProducer = (ownProps) => {
  const fetchAllOKRFunc = () => ownProps.dispatch(okrFetchAll());
  return {
    funcs: [fetchAllOKRFunc],
    workers: [setInterval(fetchAllOKRFunc, 30000)],
  }
}


export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  WithLongPolling(pollingJobProducer),
)(OKRList);
