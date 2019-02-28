import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';

import Paper from '@material-ui/core/Paper';
import {
  Grid,
  Table,
  TableHeaderRow,
  PagingPanel,
  TableRowDetail,
} from '@devexpress/dx-react-grid-material-ui';
import {
  PagingState,
  IntegratedPaging,
  RowDetailState,
} from '@devexpress/dx-react-grid';
import { 
  requestFetchAll,
  requestSendReview,
} from '../actions';
import WithLongPolling from '../core/WithLongPolling';
import QuestionStepper from './QuestionStepper';

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


const defaultPageSize = 10;
const defaultCurrentPage = 0;


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
    return (<QuestionStepper
      questions={ row.bucket.ordered_questions } onRate={ this.onRate(row.id) } request={ row } bucket={ row.bucket }/>)
  }

  render() {
    console.log(this.props.requests)
    return (
      <Paper>
        <Grid
          rows={ this.props.requests }
          columns={ columns }>
          <PagingState
            defaultCurrentPage={ defaultCurrentPage }
            pageSize={ defaultPageSize }/>
          <RowDetailState/>
          <IntegratedPaging/>
          <Table/>
          <TableHeaderRow/>
          <TableRowDetail contentComponent={ this.RowDetail } />
          <PagingPanel/>
        </Grid>
      </Paper>
    )
  }
}

RequestList.propTypes = {
  requests: PropTypes.array.isRequired,
}


const mapStateToProps = state => ({
  requests: _.cloneDeep(Object.values(state.requests).filter(req => req.status === 'Open')).map(
    request => {request.bucket_title = request.bucket.title; return request} ),
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
