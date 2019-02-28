import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { compose } from 'redux';
import WithLongPolling from '../core/WithLongPolling';

import {
  FilteringState,
  IntegratedFiltering,
} from '@devexpress/dx-react-grid';
import {
  Grid,
  Table,
  TableHeaderRow,
  TableFilterRow,
  TableRowDetail,
} from '@devexpress/dx-react-grid-material-ui';
import {
  RowDetailState,
} from '@devexpress/dx-react-grid';
import Paper from '@material-ui/core/Paper';

import { requestFetchAll } from '../actions';
import QuestionStepper from './QuestionStepper';


const current_quarter_and_year = () => {
  const now = new Date();
  return `${Math.floor(now.getMonth()/3 + 1)},${now.getFullYear()}`
}


class Summary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      columns: [
        { name: 'reviewer', title: 'Reviewer' },
        { name: 'reviewee', title: 'Reviewee' },
        { name: 'bucket_title', title: 'Review Type' },
        { name: 'quarter_and_year', title: 'Quarter, Year' },
        { name: 'summary', title: 'Summary' },
      ],
    };
  }

  RowDetail = ({ row }) => {
    return (<QuestionStepper
      questions={ row.bucket.questions } request={ row } bucket={ row.bucket } readOnly={ true }/>)
  }

  render() {
    const { columns, } = this.state;
    const { requests: rows } = this.props;

    return (
      <Paper>
        <Grid
          rows={rows}
          columns={columns}
        >
          <FilteringState defaultFilters={[{columnName: 'quarter_and_year', value: current_quarter_and_year()}]} />
          <RowDetailState/>
          <IntegratedFiltering />

          <Table />
          <TableHeaderRow />
          <TableRowDetail contentComponent={ this.RowDetail } />
          <TableFilterRow
            showFilterSelector
          />
        </Grid>
      </Paper>
    );
  }
}


const mapStateToProps = state => ({
  requests: _.cloneDeep(Object.values(state.requests).filter(req => req.status === 'Closed')).map(
    request => { request.bucket_title = request.bucket.title; return request }),
})


const mapDispatchToProps = dispatch => ({dispatch: dispatch});


const pollingJobProducer = (props) => {
  const requestFetchAllFunc = () => props.dispatch(requestFetchAll());
  return {
    funcs: [requestFetchAllFunc],
    workers: [setInterval(requestFetchAllFunc, 30000)],
  }
}


export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  WithLongPolling(pollingJobProducer),
)(Summary);
