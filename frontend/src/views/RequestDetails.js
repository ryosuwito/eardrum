import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Grid from '@material-ui/core/Grid';
// import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import Divider from '@material-ui/core/Divider';

import WithLongPolling from '../core/WithLongPolling';
import {
  requestFetchOne,
  requestSendReview,
} from '../actions';


const styles = theme => ({
  root: {
    // maxWidth: 400,
    paddingLeft: theme.spacing.unit * 6,
    paddingRight: theme.spacing.unit * 6,
    paddingBottom: theme.spacing.unit * 6,
    marginBottom: theme.spacing.unit * 12,
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
  },
  questionGroup: {
    flexGrow: 1,
    marginBottom: 20,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: 50,
    // paddingLeft: theme.spacing.unit * 4,
    backgroundColor: theme.palette.background.default,
  },
  img: {
    height: 255,
    // maxWidth: 400,
    overflow: 'hidden',
    display: 'block',
    width: '100%',
  },
  formControlGrade: {
    // margin: theme.spacing.unit,
    width: '50%',
  },
  formControl: {
    // margin: theme.spacing.unit,
    width: '100%',
  },
  textField: {
    // marginLeft: theme.spacing.unit,
    // marginRight: theme.spacing.unit,
    width: '100%',
  },
  nativeSelect: {
    // marginLeft: theme.spacing.unit,
    // marginRight: theme.spacing.unit,
    width: '100%',
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
  questionStyle: {
    width: '58%',
  },
  reviewFormStyle: {
    width: '40%',
  },
  button: {
    marginRight: theme.spacing.unit,
  },
});


const getValueOfObject = (obj, fields=[], defaultValue=null) => {
  try {
    for(let i = 0; i < fields.length; i++) {
      if (obj.hasOwnProperty(fields[i])) {
        obj = obj[fields[i]];
      } else {
        return defaultValue;
      }
    }
  } catch(err)  {
    // console.error(err)
    return defaultValue;
  }
  return obj;
}


class RequestDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      readOnly: false, // TODO Boolean(props['readOnly']),
    }
    if (this.props.request) {
      this.state = Object.assign(
        {},
        this.state,
        { reviews: this.props.request.review }
      )
    }
  }

  componentDidUpdate() {
    if (!this.state.reviews && getValueOfObject(this.props, ['request', 'review'], null) !== null) {
      this.setState({ reviews: this.props.request.review })
    }
  }

  handleChange = (questionId, name) => event => {
    const newReviews = _.cloneDeep(this.state.reviews);
    const newReview = {};
    newReview[name] = event.target.value;
    newReviews[questionId] = Object.assign({}, newReviews[questionId], newReview);
    this.setState({ reviews: newReviews })
  }

  onReviewSubmit = () => {
    const reviews = {};
    Object.keys(this.state.reviews).forEach(
      key => {
        if (this.state.reviews[key].grade !== 'NONE') {
          reviews[key] = this.state.reviews[key];
        }
      }
    );
    this.props.dispatch(requestSendReview(this.props.request.id, reviews))
  }

  render() {
    if (!this.props.request.bucket) {
      return (<h2>No Data</h2>)
    }
    const { classes, request, gradeOptions } = this.props;
    const { extra } = request.bucket;
    const questions = this.props.request.bucket.ordered_questions;
    const GradeOptions = () => (gradeOptions.map(obj =>
      (<option key={ `option-${obj.name}` } value={ obj.name }>{ obj.name }</option>)))
   
    return (
      <Paper className={ classes.root }>
        { questions.map(question => (
          <React.Fragment key={ `question-${question.id}`}>
            <Paper square elevation={0} className={classes.header}>
              <Typography variant='h5'>{ `${question.title} (${getValueOfObject(extra, [question.id], 0)} points)` }</Typography>
            </Paper>

            <Grid className={ classes.questionGroup } container justify='space-between'>
              <div className={ classes.questionStyle } dangerouslySetInnerHTML={{__html: question.html_content}}/>
              <div className={ classes.reviewFormStyle }>
                {this.state.readOnly && (
                  <React.Fragment>
                    <InputLabel htmlFor="grade-label-placeholder-readonly-id">Grade</InputLabel>
                  </React.Fragment>)}
                {!this.state.readOnly && (
                <React.Fragment>
                  <FormControl variant="outlined" className={classes.formControlGrade}>
                    <InputLabel htmlFor="grade-label-placeholder-id">
                      Grade
                    </InputLabel>
                    <Select
                      native
                      value={ getValueOfObject(this.state.reviews, [question.id, 'grade'], 0) }
                      onChange={this.handleChange(question.id, 'grade')}
                      className={ classes.nativeSelect }
                      input={<OutlinedInput labelWidth={ 45 } name="age" id="grade-label-placeholder-id" />}
                    >
                      <GradeOptions/>
                    </Select>
                  </FormControl>

                  <FormControl className={classes.formControl}>
                    <TextField
                      id="review-comment-id"
                      label="Comment"
                      multiline
                      rows="5"
                      rowsMax="5"
                      value={ getValueOfObject(this.state.reviews, [question.id, 'comment'], '') }
                      onChange={ this.handleChange(question.id, 'comment') }
                      className={classes.textField}
                      variant='outlined'
                      margin="normal"
                    />
                  </FormControl>
                </React.Fragment>)}
              </div>
            </Grid>
              <Divider variant="fullWidth" />
          </React.Fragment>
        ))}
        <Button onClick={ this.onReviewSubmit } color='primary' variant='contained' className={ classes.button }>Submit</Button>
        <Button to='/requests' component={ Link } color='primary' variant='outlined' className={ classes.button }>Back</Button>
      </Paper>
    )
  }
}


RequestDetails.propTypes = {
  readOnly: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  request: PropTypes.object.isRequired,
  match: PropTypes.object,
  gradeOptions: PropTypes.array.isRequired,
}


const mapStateToProps = (state) => {
  return ({
    request: state.request,
    gradeOptions: [{'value': 0, 'name': 'NONE'}, ..._.cloneDeep(state.gradeOptions)], 
  })
}


const mapDispatchToProps = (dispatch) => ({ dispatch: dispatch })


const pollingJobProducer = (ownProps) => {
  const requestFetchOneFunc = () => ownProps.dispatch(requestFetchOne(ownProps.match.params.requestId));
  return {
    funcs: [requestFetchOneFunc],
    workers: [],
  }
}


export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  WithLongPolling(pollingJobProducer),
  withStyles(styles),
)(RequestDetails);