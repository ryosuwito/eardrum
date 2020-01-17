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
} from '../actions';
import WithLongPolling from '../core/WithLongPolling';


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
      <React.Fragment>
        <Button color='primary' to={ `/requests/${row.id}/details`}
          component={ Link } variant='outlined'>View</Button>{' '}
        <Button color='primary' to={ `/requests/${row.id}/details`}
          component={ Link } variant='outlined' disabled={ row.status === 'Closed' }>Edit</Button>
      </React.Fragment>)
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
