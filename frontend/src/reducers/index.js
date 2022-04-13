import { combineReducers } from 'redux';

import auth from '../reducers/auth';
import requests from '../performance/reducers/requests';
import request from '../performance/reducers/request';
import gradeOptions from '../reducers/gradeOptions';
import notifications from '../reducers/notifications';
import okrs from '../okr/reducers/okrs';
import okr from '../okr/reducers/okr';
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
