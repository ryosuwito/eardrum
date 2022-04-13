import _ from 'lodash';

import ActionTypes from '../actions/types';

const okr = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.OKR_FETCH_ONE:
      return _.cloneDeep(action.payload);
    case ActionTypes.AUTH_SIGN_OUT:
      return {};
    default:
      return state;
  }
}

export default okr;
