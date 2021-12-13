import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
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
} from './actions';
import WithLongPolling from '../core/WithLongPolling';


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
          <Typography component='div' dangerouslySetInnerHTML={{__html: row.html_content}}/>
          { row.files && 
            <div>{row.files.map(function(object, i){
              return <a href={object.file} target="_blank" ><div>{object.name}</div></a>;})
            }</div>}
          <div style={{ textAlign: 'end', marginBottom: '10px'}}>
            <Button color='primary' to={ `/okrs/${row.id}`}
            component={ Link } variant='outlined'>View and Edit</Button>{' '}
          </div>
        </React.Fragment>)
    }
    return (
      <div style={{marginTop: '20px'}}>
      <div style={{ textAlign: 'end', marginBottom: '10px'}}>
        <Button to='/okrs/new' color="primary" variant="contained" component={ Link }>New</Button>
      </div>
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
          <Table/>
          <TableHeaderRow showSortingControls/>
          <TableRowDetail contentComponent={ RowDetail } />
          <TableFilterRow showFilterSelector/>
        </Grid>
      </Paper>
      </div>
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
