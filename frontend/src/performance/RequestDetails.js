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
import { Breadcrumb } from 'antd';

import WithLongPolling from '../core/WithLongPolling';
import {
  requestFetchOne,
  requestSendReview,
} from './actions';

import { convertToHTML, convertFromHTML } from 'draft-convert';
import { EditorState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

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
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
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
  }

  componentDidUpdate() {
    const request = getValueOfObject(this.props, ['request'], null);
    if (request !== null && this.state.requestId !== request.id) {
      this.setState({ reviews: this.props.request.review, requestId: this.props.request.id })
      console.log("REVIEWS", this.props.request.review)
    }
  }

  handleChange = (questionId, name, event) => {
    const newReviews = _.cloneDeep(this.state.reviews);
    const newReview = {};
    if(event.constructor.name !="EditorState" ) newReview[name] = event.target.value;
    else {
      newReview[name] = event
    }
    newReviews[questionId] = Object.assign({}, newReviews[questionId], newReview);
    this.setState({ reviews: newReviews })
  }

  onReviewSubmit = () => {
    const reviews = {..._.cloneDeep(this.props.request.review), gradeoptions: this.props.gradeOptions};
    Object.keys(this.state.reviews).forEach(
      key => {
        if (this.state.reviews[key].grade !== 'NONE') {
          reviews[key] = this.state.reviews[key];
        }
        if( "comment" in this.state.reviews[key] && this.state.reviews[key]["comment"].constructor.name =="EditorState" ) {
          const html = convertToHTML(this.state.reviews[key]["comment"].getCurrentContent());
          this.state.reviews[key]["comment"] = html
        }
      }
    );

    console.log("log reviews");
    console.log(reviews);

    this.props.dispatch(requestSendReview(this.props.request.id, reviews))
  }

  render() {
    if (!this.props.request.bucket) {
      return (<h2>No Data</h2>)
    }
    const { classes, request, gradeOptions } = this.props;
    const { extra } = request.bucket;
    const questions = this.props.request.bucket.ordered_questions;
    const GradeOptions = () => {
      let names = []
      return gradeOptions.map(obj =>
      {
        if(!names.includes(obj.name)) {
          names.push(obj.name)
          return <option key={ `option-${obj.name}` } value={ obj.name }>{ obj.name }</option>
        }
        return null;
      })
    }

    return (
      <Paper className={ classes.root }>
        <Breadcrumb style={{ paddingTop: '10px' }}>
          <Breadcrumb.Item>
            <Link to='/'>Performance</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>View & Edit</Breadcrumb.Item>
        </Breadcrumb>
        <React.Fragment>
          <div style={ {height: '50px'} }/>
          <Typography variant='h4'>{ request.bucket_title }</Typography>
          <div style={ {height: '50px'} }/>
          <Typography variant='h5'>{ `Reviewer: ${request.reviewer}` }</Typography>
          <br/>
          <Typography variant='h5'>{ `Reviewee: ${request.reviewee}` }</Typography>
          <br/>
          <Typography variant='h5'>{ `Quarter, Year: ${request.quarter_and_year}` }</Typography>
          <div style={ {height: '50px'} }/>
        </React.Fragment>
        { questions.map(question => (
          <div key={ `question-${question.id}`}>
            <Paper square elevation={0} className={classes.header}>
              {question.typ === '' &&
              <Typography variant='h5'>{ `${question.title} (${getValueOfObject(extra, [question.id], 0)} points)` }</Typography>}
              {question.typ !== '' &&
              <Typography variant='h5'>{ `${question.title}` }</Typography>}
            </Paper>

            <Grid className={ classes.questionGroup } container justify='space-between'>
              <div className={ classes.questionStyle } dangerouslySetInnerHTML={{__html: question.html_content}}/>
              <div className={ classes.reviewFormStyle }>
                {!this.state.readOnly && question.typ === '' && (
                <React.Fragment>
                  <FormControl variant="outlined" className={classes.formControlGrade}>
                    <InputLabel htmlFor="grade-label-placeholder-id">
                      Grade
                    </InputLabel>
                    <Select
                      native
                      value={ getValueOfObject(this.state.reviews, [question.id, 'grade'], 0) }
                      onChange={this.handleChange.bind(this, question.id, 'grade')}
                      className={ classes.nativeSelect }
                      input={<OutlinedInput labelWidth={ 45 } name="age" id="grade-label-placeholder-id" />}
                    >
                      <GradeOptions/>
                    </Select>
                  </FormControl>
                </React.Fragment>)}
              </div>
              {(question.typ === 'comment' || question.typ === '') && (
                <div style={{border: "1px solid #bbb", borderRadius: "3px"}}>
                  <Editor
                    editorState={ getValueOfObject(this.state.reviews, [question.id, 'comment'], '').constructor.name =="EditorState" ?
                      getValueOfObject(this.state.reviews, [question.id, 'comment'], '') :
                      EditorState.createWithContent(convertFromHTML(getValueOfObject(this.state.reviews, [question.id, 'comment'], '')))}
                    wrapperClassName="demo-wrapper"
                    editorClassName="demo-editor"
                    onEditorStateChange={this.handleChange.bind(this, question.id, 'comment')}
                  />
                </div>
              )}
            </Grid>
              <Divider variant="fullWidth" />
          </div>
        ))}
        <div className={classes.buttonGroup}>
          <Button to='/' component={ Link } color='primary' variant='outlined' >Back</Button>
          <Button onClick={ this.onReviewSubmit } color='primary' variant='contained'>Submit</Button>
        </div>
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
  let gradeOptions;
  if (state.request && state.request.review && state.request.review.gradeoptions) {
    gradeOptions = [{'value': 0, 'name': 'NONE'}, ..._.cloneDeep(state.request.review.gradeoptions)]
  } else {
    gradeOptions = [{'value': 0, 'name': 'NONE'}, ..._.cloneDeep(state.gradeOptions)]
  }
  return ({
    request: {..._.cloneDeep(state.request), bucket_title: !state.request.bucket? null: state.request.bucket.title},
    gradeOptions,
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
