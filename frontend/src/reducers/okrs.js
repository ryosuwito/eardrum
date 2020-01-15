import _ from 'lodash';

import ActionTypes from '../actions/types';


const okrs = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.OKR_FETCH_ALL:
      return _.mapKeys(action.payload, okr => okr.id);
    default:
      return state;
  }
}

export default okrs;
