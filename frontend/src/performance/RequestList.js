import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import {
  Grid,
  TableHeaderRow,
  TableRowDetail,
  VirtualTable,
  TableFilterRow,
} from '@devexpress/dx-react-grid-material-ui';
import {
  RowDetailState,
  DataTypeProvider,
  FilteringState,
  SortingState,
  IntegratedFiltering,
  IntegratedSorting,
} from '@devexpress/dx-react-grid';
import {
  requestFetchAll,
  requestSendReview,
} from './actions';
import url from './actions/urls';
import WithLongPolling from '../core/WithLongPolling';


import axios from 'axios';
import { enqueueSnackbar } from '../actions';

const DatetimeFormatter = ({ value }) => {
  const time = new Date(value);
  const twoLastDigits = value => ('0' + value % 100).slice(-2)
  const x = twoLastDigits;
  return `${x(time.getFullYear())}${x(time.getMonth()+1)}${x(time.getDay())} ${x(time.getHours())}:${x(time.getMinutes())}:${x(time.getSeconds())}`;
}


// const current_quarter_and_year = () => {
//   const now = new Date();
//   return `${Math.floor(now.getMonth()/3 + 1)},${now.getFullYear()}`
// }


const DatetimeTypeProvider = props => (
  <DataTypeProvider
    formatterComponent={ DatetimeFormatter }
    {...props}
    />
)


const styles = {
  Open: {
    backgroundColor: '#e3f2fd',
  },
  Closed: {
    backgroundColor: '#e8f5e9',
  }
};

const VirtualTableRow = ({ row, ...restProps }) => (
  <VirtualTable.Row
    {...restProps}
    // eslint-disable-next-line no-alert
    style={{
      ...styles[row.status],
    }}
  />
);

const columns = [
  // { name: 'id', title: 'Id' },
  { name: 'reviewer', title: 'Reviewer' },
  { name: 'reviewee', title: 'Reviewee' },
  { name: 'bucket_title', title: 'Review Type' },
  { name: 'quarter_and_year', title: 'Quarter and Year'},
  { name: 'progress', title: 'Progress' },
  { name: 'summary', title: 'Summary' },
  { name: 'close_at', title: 'Close At' },
  // { name: 'content', title: 'Content' },
]

const datetimeColumns = ['close_at'];


const sortingStateColumnExtensions = [
  { columnName: 'reviewer', sortingEnabled: false },
  { columnName: 'reviewee', sortingEnabled: false },
  { columnName: 'bucket_title', sortingEnabled: false },
  { columnName: 'quarter_and_year', sortingEnabled: false },
  { columnName: 'progress', sortingEnabled: false },
  { columnName: 'close_at', sortingEnabled: false },
]


class RequestList extends Component {
  getPdf = async (request_id) => {  
    try {
      await axios({
        responseType: 'blob',
        method: 'get',
        url: url.REQUEST_ACTION('get_pdf')(request_id),
      }).then((response) => {
          let filename = response.headers["content-disposition"].split("; filename=")[1]
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();      
          this.props.dispatch(enqueueSnackbar({
            message: "Successfully Downloading PDF",
            options: {
              variant: 'success',
            }
          }))
      });
    } catch (error) {
      console.log(error)
      this.props.dispatch(enqueueSnackbar({
        message: "Error Downloading PDF",
        options: {
          variant: 'error',
        }
      }))
    }
  }
  onRate = reqId => (qId, value) => {
    this.props.requests.forEach(req => {
      if (req.id === reqId) {
        req.reviews[qId] = {grade: value.grade, comment: value.comment};
        this.props.dispatch(requestSendReview(reqId));
      }
    })
  }

  RowDetail = ({ row }) => {
    return (
      <div style={{ textAlign: 'end' }}>
        <Button color='primary' onClick={()=>{this.getPdf(row.id)}}
          component={ Link } variant='outlined'>Download</Button>
        <Button color='primary' to={ `/performance/${row.id}/details`}
          component={ Link } variant='outlined'>View</Button>{' '}
        <Button color='primary' to={ `/performance/${row.id}/details`}
          component={ Link } variant='outlined' disabled={ row.status === 'Closed' }>Edit</Button>
      </div>)
  }

  render() {
    return (
      <Paper>
        <Grid
          rows={ this.props.requests }
          columns={ columns }>
          <FilteringState/>
          <SortingState columnExtensions={ sortingStateColumnExtensions }/>
          <DatetimeTypeProvider for={ datetimeColumns } />
          <IntegratedFiltering />
          <IntegratedSorting />
          <RowDetailState />
          <VirtualTable height="700px" rowComponent={ VirtualTableRow }/>
          <TableHeaderRow showSortingControls/>
          <TableRowDetail contentComponent={ this.RowDetail } />
          <TableFilterRow showFilterSelector/>
        </Grid>
      </Paper>
    )
  }
}

RequestList.propTypes = {
  requests: PropTypes.array.isRequired,
}


const mapStateToProps = state => ({
  requests: _.cloneDeep(Object.values(state.requests)),
})


const mapDispatchToProps = dispatch => ({
  dispatch: dispatch,
})

const pollingJobProducer = (ownProps) => {
  const fetchRequestAllFunc = () => ownProps.dispatch(requestFetchAll());
  return {
    funcs: [fetchRequestAllFunc],
    workers: [setInterval(fetchRequestAllFunc, 30000)],
  }
}


export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  WithLongPolling(pollingJobProducer),
)(RequestList);
