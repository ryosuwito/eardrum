import { combineReducers } from 'redux';

import auth from '../reducers/auth';
import requests from '../reducers/requests';
import request from '../reducers/request';
import gradeOptions from '../reducers/gradeOptions';
import notifications from '../reducers/notifications';
import okrs from '../reducers/okrs';
import okr from '../reducers/okr';
import users from '../reducers/users';
import user from '../reducers/user';


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
    // okrs
    okrs,
    // selected okr,
    okr,
    // user list
    users,
    // user
    user,
  }
)
