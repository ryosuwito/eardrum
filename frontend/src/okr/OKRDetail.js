import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core'
import { Breadcrumb } from 'antd';
import WithLongPolling from '../core/WithLongPolling';
import {
  okrFetchOne,
  onSaveOKR,
  onCreateOKR,
  onDeleteOKR,
} from './actions';

import { enqueueSnackbar } from '../actions';


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


function SimpleDialog(props) {
  const { open, onClose, okr } = props;

  return (
    <Dialog onClose={onClose(false)} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle>Do you want to delete this OKR?</DialogTitle>
      <DialogContent>
        <table style={{textAlign: 'left'}}>
          <tbody>
            <tr>
              <th>Issuer</th>
              <td>{okr.issuer}</td>
            </tr>
            <tr>
              <th>Quarter</th>
              <td>{okr.quarter}</td>
            </tr>
            <tr>
              <th>Year</th>
              <td>{okr.year}</td>
            </tr>
          </tbody>
        </table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose(true)} color='default' variant='contained'>Yes</Button>
        <Button onClick={onClose(false)} color='primary' variant='contained'>No</Button>
      </DialogActions>
    </Dialog>
  );
}

SimpleDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
};


class OKRDetail extends Component {
  constructor(props) {
    super(props);
    const defaultOKR = {};
    if (this.props.new) {
      const now = new Date();
      defaultOKR.quarter = Math.floor(now.getMonth()/3) + 1;
      defaultOKR.year = now.getFullYear();
    }
    this.state = {
      readOnly: false, // TODO Boolean(props['readOnly']),
      okrContentState: 'write',
      loadingPreview: false,
      okr: defaultOKR,
      dialogOpen: false,
    }
  }

  okrContentStateChange = (newState) => (event )=> {
    if (newState === 'preview') {
      this.getPreviewContent();
    }
    this.setState({okrContentState: newState})
  }

  handleChange = (name) => event => {
    const newOKR = _.cloneDeep(this.state.okr);
    newOKR[name] = event.target.value;
    this.setState({ okr: newOKR })
  }

  getOKRValue = (name) => {
    return this.state.okr[name] || this.props.okr[name];
  }

  componentDidUpdate() {
  }

  getPreviewContent = async () => {
    const okrContent = this.getOKRValue('content');
    if (okrContent !== this.state.lastContent) {
      this.setState({ loadingPreview: true, lastContent: okrContent });
      try {
        let bodyFormData = new FormData();
        bodyFormData.set('content', okrContent)
        const res = await axios({
          method: 'post',
          url: '/markdownx/markdownify/',
          data: bodyFormData,
          headers: {'Content-Type': 'multipart/form-data'},
        });
        console.log(res.data);
        this.setState({ loadingPreview: false, previewContent: res.data});
      } catch (err) {
        console.log(err);
      } finally {
        this.setState({ loadingPreview: false })
      }
    }
  }

  onSaveForm = async (event) => {
    try {
      if (this.state.okr !== null && this.state.okr !== undefined && Object.keys(this.state.okr).length > 0) {
        if (!this.props.new) {
          const isSucceeded = await (await onSaveOKR(this.props.match.params.okrId, this.state.okr))(this.props.dispatch);
          if (isSucceeded) {
            this.setState({ okr: {} });
          }
        } else {
          const isSucceeded = await (await onCreateOKR(this.state.okr))(this.props.dispatch);
          if (isSucceeded) {
            this.props.history.push('/okrs');
          }
        }
      } else {
        throw Error('Empty Form! Fill in the form, please!')
      }
    } catch (err) {
      this.props.dispatch(enqueueSnackbar({
        message: err.message,
        options: {
          variant: 'error',
        }
      }))
    }
  }

  onDeleteOKR = () => {
    this.setState({dialogOpen: true})
  }

  onCloseDialog = (answer=false) => async () => {
    if (answer) {
      try {
        const isSucceeded = await (await onDeleteOKR(this.props.okr.id))(this.props.dispatch);
        if (isSucceeded) {
          this.props.history.push('/okrs')
        }
      } catch (err) {
        this.props.dispatch(enqueueSnackbar({
          message: err.message,
          options: {
            variant: 'error',
          }
        }))
      }
    } else {
      this.setState({dialogOpen: false})
    }
  }

  render() {
    if (!this.props.new && this.props.okr.id != this.props.match.params.okrId) {
      return (<Typography component='h1'>Loading...</Typography>)
    }

    const { classes } = this.props;

    return (
      <Paper className={ classes.root }>
        <Breadcrumb style={{ marginBottom: '24px', paddingTop: '10px' }}>
          <Breadcrumb.Item>
            <Link to='/okrs'>OKR</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{this.props.new ? 'New' : 'View & Edit'}</Breadcrumb.Item>
        </Breadcrumb>
        <div>
          {!this.props.new && (<SimpleDialog open={this.state.dialogOpen} onClose={ this.onCloseDialog } okr={ this.props.okr }/>)}
          <Grid className={ classes.questionGroup } container justify='space-between'>
            <React.Fragment>
              {!this.props.new && this.props.user && this.props.user.is_admin && (<FormControl variant="outlined" className={classes.formControl}>
                <TextField
                  label="Issuer"
                  defaultValue={ this.getOKRValue('issuer') }
                  onChange={ this.handleChange('issuer') }
                  className={classes.textField}
                  variant='outlined'
                  margin="normal"
                  disabled={true}
                />
              </FormControl>)}

              <FormControl variant="outlined" className={classes.formControl} style={{marginTop: '10px'}}>
                <InputLabel htmlFor="grade-label-placeholder-id">
                  Quarter
                </InputLabel>
                <Select
                  native
                  defaultValue={ this.getOKRValue('quarter') }
                  onChange={this.handleChange('quarter')}
                  input={<OutlinedInput labelWidth={ 45 }
                  name="quarter" id="grade-label-placeholder-id" />}
                >
                  <option value='1'>1</option>
                  <option value='2'>2</option>
                  <option value='3'>3</option>
                  <option value='4'>4</option>
                </Select>
              </FormControl>

              <FormControl variant="outlined" className={classes.formControl}>
                <TextField
                  label="Year"
                  defaultValue={ this.getOKRValue('year') }
                  onChange={ this.handleChange('year') }
                  className={classes.textField}
                  variant='outlined'
                  margin="normal"
                />
              </FormControl>
              <FormControl>
                <Button disabled={ this.state.okrContentState !== 'preview'} onClick={ this.okrContentStateChange('write') }>Write</Button>
                <Button disabled={ this.state.okrContentState !== 'write'} onClick={ this.okrContentStateChange('preview')}>Preview</Button>
              </FormControl>

              {this.state.okrContentState === 'write' &&
              <FormControl className={classes.formControl}>
                <TextField
                  label="Content"
                  multiline
                  rows="20"
                  rowsMax="20"
                  defaultValue={ this.getOKRValue('content') }
                  onChange={ this.handleChange('content') }
                  className={classes.textField}
                  variant='outlined'
                  margin="normal"
                  placeholder='Simple markdown features are available'
                  autoFocus={ true }
                />
              </FormControl>}
              {this.state.okrContentState === 'preview' && this.state.loadingPreview === true &&
              <FormControl className={classes.formControl}><Typography component='h1'>Loading...</Typography></FormControl>}
              {this.state.okrContentState === 'preview' && this.state.loadingPreview === false &&
              <FormControl className={classes.formControl}><Typography component='div' dangerouslySetInnerHTML={{__html: this.state.previewContent }}/></FormControl>}

            </React.Fragment>
          </Grid>
        </div>
        <Divider variant="fullWidth" />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
          <Button onClick={ this.onSaveForm } color='primary' variant='contained' className={ classes.button }>Save</Button>
          <Button to='/okrs' component={ Link } color='primary' variant='outlined' className={ classes.button }>Cancel & Back</Button>
          {!this.props.new && (<Button onClick={ this.onDeleteOKR } variant='contained' color='secondary'>Delete</Button>)}
        </div>
      </Paper>
    )
  }
}


OKRDetail.propTypes = {
  readOnly: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  okr: PropTypes.object.isRequired,
  match: PropTypes.object,
  new: PropTypes.bool,
}


const mapStateToProps = (state, props) => {
  if (isNaN(parseInt(props.match.params.okrId))) {
    return ({
      okr: {},
      user: _.cloneDeep(state.user),
      users: _.cloneDeep(state.users),
      new: true,
    })
  } else {
    return ({
      okr: _.cloneDeep(state.okr),
      user: _.cloneDeep(state.user),
      users: _.cloneDeep(state.users),
      new: false,
    })
  }
}


const mapDispatchToProps = (dispatch) => ({ dispatch: dispatch })


const pollingJobProducer = (ownProps) => {
  if (isNaN(parseInt(ownProps.match.params.okrId))) {
    return {
      funcs: [], workers: [],
    }
  }
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
