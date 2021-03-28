import ActionTypes from '../actions/types';

const requests = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.REQUEST_FETCH_ONE:
      return action.payload;
    default:
      return state;
  }
};

export default requests;
