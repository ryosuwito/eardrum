import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { withStyles } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';


const styles = theme => ({
  root: {
    // maxWidth: 400,
    flexGrow: 1,
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
  questionContent: {
    width: '58%',
  },
  questionReview: {
    width: '40%',
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


class QuestionTextMobileStepper extends React.Component {
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
    const { classes, questions, bucket, request, readOnly, } = this.props;
    const { activeStep } = this.state;
    const { review } = request;
    const question = questions[activeStep];
    if (request === undefined || request === null || questions.length === 0) {
      return <h3>No Data</h3>
    }


    return (
      <div className={classes.root}>
        <MobileStepper
          steps={this.state.maxSteps}
          position="static"
          variant="dots"
          activeStep={activeStep}
          nextButton={
            <Button size="small" onClick={this.handleNext} disabled={activeStep === this.state.maxSteps - 1}>
              Next
              <KeyboardArrowRight />
            </Button>
          }
          backButton={
            <Button size="small" onClick={this.handleBack} disabled={activeStep === 0}>
              <KeyboardArrowLeft />
              Back
            </Button>
          }
        />
        { !readOnly &&
        <Button color='primary' to={ `/requests/${request.id}/details`}
        component={ Link } variant='outlined'>Edit</Button> }
        <Paper square elevation={0} className={classes.header}>
          <Typography variant='h5'>{ `${question.title} (${getValueOfObject(bucket.extra, [question.id], 0)} points)` }</Typography>
        </Paper>
        <Grid container justify='space-between'>
          <div dangerouslySetInnerHTML={{__html: question.html_content}} className={ classes.questionContent }/>
          <div className={ classes.questionReview }>
            <FormControl variant="outlined" className={classes.formControlGrade}>
              <TextField
                id="review-grade-id"
                label='Grade'
                InputProps={{readOnly: true}}
                variant='outlined'
                value={ getValueOfObject(review, [question.id, 'grade'], 'NONE') } />
            </FormControl>

            <FormControl className={classes.formControl}>
              <TextField
                id="review-comment-id"
                label="Comment"
                multiline
                rows="3"
                rowsMax="3"
                value={ getValueOfObject(review, [question.id, 'comment'], '') }
                className={classes.textField}
                variant='outlined'
                margin="normal"
                InputProps={{readOnly: true}}
              />
            </FormControl>
          </div>
        </Grid>
      </div>
    );
  }
}


QuestionTextMobileStepper.propTypes = {
  questions: PropTypes.array.isRequired,
  classes: PropTypes.object.isRequired,
  request: PropTypes.object.isRequired,
  bucket: PropTypes.object.isRequired,
}


export default withStyles(styles)(QuestionTextMobileStepper);