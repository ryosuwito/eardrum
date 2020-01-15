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
  okrFetchOne,
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


class OKRDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      readOnly: false, // TODO Boolean(props['readOnly']),
      okrContentState: 'write',
    }
    if (this.props.okr) {
      this.state = Object.assign(
        {},
        this.state,
        { okr: this.props.okr },
      )
    }
  }

  okrContentStateChange = (newState) => (event )=> {
    this.setState({okrContentState: newState})
  }

  handleChange = (name) => event => {
    const newOKR = _.cloneDeep(this.state.okr);
    newOKR[name] = event.target.value;
    this.setState({ okr: newOKR })
  }

  onReviewSubmit = () => {
    // const reviews = {};
    // Object.keys(this.state.reviews).forEach(
    //   key => {
    //     if (this.state.reviews[key].grade !== 'NONE') {
    //       reviews[key] = this.state.reviews[key];
    //     }
    //   }
    // );
    // this.props.dispatch(requestSendReview(this.props.request.id, reviews))
  }

  render() {
    if (this.props.okr.id != this.props.match.params.okrId) {
      return (<h2>Loading...</h2>)
    }
    const { classes } = this.props;

    const getOKRValue = (name) => {
      return this.props.okr[name] || this.state.okr[name];
    }
   
    return (
      <Paper className={ classes.root }>
        <div>
          <Grid className={ classes.questionGroup } container justify='space-between'>
            <React.Fragment>
              <FormControl variant="outlined" className={classes.formCOntrol}>
                <TextField
                  label="Issuer"
                  defaultValue={ getOKRValue('issuer') }
                  onChange={ this.handleChange('issuer') }
                  className={classes.textField}
                  variant='outlined'
                  margin="normal"
                />
              </FormControl>

              <FormControl variant="outlined" className={classes.formControl}>
                <TextField
                  label="Quarter"
                  defaultValue={ getOKRValue('quarter') }
                  onChange={ this.handleChange('quarter') }
                  className={classes.textField}
                  variant='outlined'
                  margin="normal"
                />
              </FormControl>

              <FormControl variant="outlined" className={classes.formControl}>
                <TextField
                  label="Year"
                  defaultValue={ getOKRValue('year') }
                  onChange={ this.handleChange('year') }
                  className={classes.textField}
                  variant='outlined'
                  margin="normal"
                />
              </FormControl>

              <Button disabled={ this.state.okrContentState !== 'preview'} onClick={ this.okrContentStateChange('write') }>Write</Button>
              <Button disabled={ this.state.okrContentState !== 'write'} onClick={ this.okrContentStateChange('preview')}>Preview</Button>

              {this.state.okrContentState === 'write' &&
              <FormControl className={classes.formControl}>
                <TextField
                  label="Content"
                  multiline
                  rows="30"
                  rowsMax="30"
                  defaultValue={ getOKRValue('content') }
                  onChange={ this.handleChange('content') }
                  className={classes.textField}
                  variant='outlined'
                  margin="normal"
                />
              </FormControl>}
              {this.state.okrContentState === 'preview' &&
              <Paper><div dangerouslySetInnerHTML={{__html: getOKRValue('html_content')}}/></Paper>}

            </React.Fragment>
          </Grid>
        </div>
        <Divider variant="fullWidth" />
        <Button onClick={ this.onReviewSubmit } color='primary' variant='contained' className={ classes.button }>Save</Button>
        <Button to='/' component={ Link } color='primary' variant='outlined' className={ classes.button }>Cancel & Back</Button>
      </Paper>
    )
  }
}


OKRDetail.propTypes = {
  readOnly: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  okr: PropTypes.object.isRequired,
  match: PropTypes.object,
}


const mapStateToProps = (state) => {
  return ({
    okr: _.cloneDeep(state.okr),
  })
}


const mapDispatchToProps = (dispatch) => ({ dispatch: dispatch })


const pollingJobProducer = (ownProps) => {
  const fetchOneOKRFunc = () => ownProps.dispatch(okrFetchOne(ownProps.match.params.okrId));
  return {
    funcs: [fetchOneOKRFunc],
    workers: [],
  }
}


export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  WithLongPolling(pollingJobProducer),
  withStyles(styles),
)(OKRDetail);