import _ from 'lodash';

import ActionTypes from '../actions/types';


const user = (state = {}, action) => {
  switch(action.type) {
    case ActionTypes.GET_CURRENT_USER:
      return _.cloneDeep(action.payload);
    case ActionTypes.AUTH_SIGN_OUT:
      return {}
    default:
      return state;
  }
}

export default user;
