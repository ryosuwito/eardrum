import _ from 'lodash';

import ActionTypes from '../actions/types';


const okr = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.OKR_FETCH_ONE:
      return action.payload;
    default:
      return state;
  }
}

export default okr;

