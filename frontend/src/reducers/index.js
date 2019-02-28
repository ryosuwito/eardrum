import { combineReducers } from 'redux';

import auth from '../reducers/auth';
import requests from '../reducers/requests';
import request from '../reducers/request';
import gradeOptions from '../reducers/gradeOptions';
import notifications from '../reducers/notifications';


export default combineReducers(
  {
    // Reducer list

    // authentication
    auth,
    // requests
    requests,
    // request
    request,
    // grade_options
    gradeOptions,
    // notifications
    notifications,
  }
)
