/* eslint-disable react/prop-types */
import React  from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withSnackbar } from 'notistack';
import { removeSnackbar } from '../actions/index';

class Notifier extends React.Component {
  displayed = {};

  storeDisplayed = (id) => this.displayed[id] = true;

  removeDisplayed = id => delete this.displayed[id];

  shouldComponentUpdate({ notifications: newSnacks = {}}) {
    if (!Object.keys(newSnacks).length) {
      for (let k in newSnacks) {
        this.removeDisplayed(k);
      }
      return false;
    }
    
    for (let k in newSnacks) {
      if (newSnacks[k].dismissed) {
        this.props.closeSnackbar(k);
        this.props.removeSnackbar(k);
        this.removeDisplayed(k);
      }
    }

    const { notifications: currentSnacks = {} } = this.props;
    const notExists = Object.keys(newSnacks).filter(k => !currentSnacks.hasOwnProperty(k)).length > 0;

    return notExists;
  }

  componentDidUpdate() {
    const { notifications: notifs = [] } = this.props;

    Object.values(notifs).forEach(({ key, message, options = {} }) => {
      // Do nothing if snackbar is already displayed
      if (this.displayed.hasOwnProperty(key)) return;
      // Display snackbar using notistack
      this.props.enqueueSnackbar(message, {
        ...options,
        onClose: (event, reason, key) => {
          if (options.onClose) {
            options.onClose(event, reason, key);
          }
          // Dispatch action to remove snackbar from redux store
          this.props.removeSnackbar(key);
          this.removeDisplayed(key);
        }
      });
      // Keep track of snackbars that we've displayed
      this.storeDisplayed(key);
    });
  }

  render() {
    return null;
  }
}

const mapStateToProps = state => ({
  notifications: state.notifications,
});

const mapDispatchToProps = dispatch => bindActionCreators({ removeSnackbar }, dispatch);

export default withSnackbar(connect(
  mapStateToProps,
  mapDispatchToProps,
)(Notifier));
