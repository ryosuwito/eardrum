import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
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

import { connect } from 'react-redux';


const columns = [
  // { name: 'id', title: 'Id' },
  { name: 'title', title: 'Title' },
  // { name: 'content', title: 'Content' },
]


const defaultPageSize = 10;
const defaultCurrentPage = 0;


const styles = theme => ({
  root: {
    maxWidth: 400,
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 50,
    // paddingLeft: theme.spacing(4),
    backgroundColor: theme.palette.background.default,
  },
  img: {
    height: 255,
    maxWidth: 400,
    overflow: 'hidden',
    display: 'block',
    width: '100%',
  },
});


class QuestionTextMobileStepper extends Component {
  constructor(props) {
    super(props)
    this.state = {
      maxSteps: this.props.questions.length,
      activeStep: 0,
    }
  }

  handleNext = () => {
    this.setState({
      activeStep: this.state.activeStep + 1,
    })
  }

  handleBack = () => {
    this.setState({
      activeStep: this.state.activeStep - 1,
    })
  }

  render() {
    const { classes, questions } = this.props;
    console.log(classes)

    return (
      <div className={classes.root}>
        <MobileStepper
          steps={this.state.maxSteps}
          position="static"
          variant="dots"
          activeStep={this.state.activeStep}
          nextButton={
            <Button size="small" onClick={this.handleNext} disabled={this.state.activeStep === this.state.maxSteps - 1}>
              Next
              <KeyboardArrowRight />
            </Button>
          }
          backButton={
            <Button size="small" onClick={this.handleBack} disabled={this.state.activeStep === 0}>
              <KeyboardArrowLeft />
              Back
            </Button>
          }
        />

        <Paper square elevation={0} className={classes.header}>
          <Typography>{questions[this.state.activeStep].title}</Typography>
        </Paper>
        <div dangerouslySetInnerHTML={{__html: questions[this.state.activeStep].html_content}}/>
      </div>
    );
  }
}


QuestionTextMobileStepper.propTypes = {
  questions: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
}


const WithStylesQuestionStepper = withStyles(styles)(QuestionTextMobileStepper)


const RowDetail = ({ row }) => (<WithStylesQuestionStepper questions={ row.questions }/>)
// const RowDetail = ({ row }) => (<div>{ row.description }</div>)


class BucketList extends Component {
  render() {
    console.log(this.props.buckets)
    return (
      <Paper>
        <Grid
          rows={ this.props.buckets }
          columns={ columns }>
          <PagingState
            defaultCurrentPage={ defaultCurrentPage }
            pageSize={ defaultPageSize }/>
          <RowDetailState/>
          <IntegratedPaging/>
          <Table/>
          <TableHeaderRow/>
          <TableRowDetail contentComponent={ RowDetail }/>
          <PagingPanel/>
        </Grid>
      </Paper>
    )
  }
}


const mapStateToProps = state => ({
  buckets: _.cloneDeep(Object.values(state.buckets)).map(bucket => {
    bucket.question_ids = bucket.questions;
    bucket.questions = [];
    if (bucket.question_ids) {
      bucket.question_ids.forEach(qId => bucket.questions.push(state.questions[qId]))
    }

    return bucket;
  }),
})


const mapDispatchToProps = dispatch => ({
  dispatch: dispatch,
})


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BucketList);
