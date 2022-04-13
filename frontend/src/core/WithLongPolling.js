/**
 * With long polling producer
 */
import React, { Component } from 'react';


function withLongPolling(pollingJobProducer) {
  return WrappedCompoent => {
    return class extends Component {

      componentWillMount() {
        if (!this.pollingJob) {
          this.pollingJob = pollingJobProducer(this.props)
        }
      }

      componentDidMount() {
        if (this.pollingJob && this.pollingJob.hasOwnProperty('funcs')) {
          this.pollingJob.funcs.forEach(func => func())
        }
      }

      componentWillUnmount() {
        if (this.pollingJob && this.pollingJob.hasOwnProperty('workers')) {
          this.pollingJob.workers.forEach(intervalId => clearInterval(intervalId))
        }
      }

      render() {
        return (<WrappedCompoent pollingJob={ this.pollingJob } {...this.props}/>)
      }
    }
  }
}

export default withLongPolling;
