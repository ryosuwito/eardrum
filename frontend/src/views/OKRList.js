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
  okrFetchAll,
  okrFetchOne,
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
  { name: 'id', title: 'ID' },
  { name: 'issuer', title: 'Issuer' },
  { name: 'quarter', title: 'Quarter' },
  { name: 'year', title: 'Year'},
  // { name: 'content', title: 'Content' },
]

// const datetimeColumns = ['close_at'];


const sortingStateColumnExtensions = [
  { columnName: 'id', sortingEnabled: false },
  { columnName: 'issuer', sortingEnabled: false },
  { columnName: 'quarter', sortingEnabled: false },
  { columnName: 'year', sortingEnabled: false },
]


class OKRList extends Component {
  render() {
    const RowDetail = ({ row }) => {
      return (
        <React.Fragment>
          <Button color='primary' to={ `/okrs/${row.id}`}
            component={ Link } variant='outlined'>View and Edit</Button>{' '}
        </React.Fragment>)
    }
    return (
      <Paper>
        <Grid
          rows={ this.props.okrs }
          columns={ columns }>
          <FilteringState/>
          <SortingState columnExtensions={ sortingStateColumnExtensions }/>
          {/* <DatetimeTypeProvider for={ datetimeColumns } /> */}
          <IntegratedFiltering />
          <IntegratedSorting />
          <RowDetailState />
          <VirtualTable height="700px" rowComponent={ VirtualTableRow }/>
          <TableHeaderRow showSortingControls/>
          <TableRowDetail contentComponent={ RowDetail } />
          <TableFilterRow showFilterSelector/>
        </Grid>
      </Paper>
    )
  }
}

OKRList.propTypes = {
  okrs: PropTypes.array.isRequired,
}


const mapStateToProps = state => ({
  okrs: _.cloneDeep(Object.values(state.okrs)),
})


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
