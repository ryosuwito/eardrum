import _ from 'lodash';

import ActionTypes from '../actions/types';

const requests = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.REQUEST_FETCH_ALL:
      return _.mapKeys(action.payload, (req) => req.id);
    default:
      return state;
  }
};

export default requests;
