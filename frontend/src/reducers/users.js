import _ from 'lodash';

import ActionTypes from '../actions/types';


const users = (state = {}, action) => {
  switch(action.type) {
    case ActionTypes.USER_FETCH_ALL:
      return _.mapKeys(action.payload, user => user.id);
    default:
      return state;
  }
}

export default users;
