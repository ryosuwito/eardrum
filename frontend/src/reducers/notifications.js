import _ from 'lodash';
import ActionTypes from '../actions/types';


export default (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.SNACKBAR_ENQUEUE:
      return {
        ...state,
        [action.payload.key]: action.payload, 
      };

    case ActionTypes.SNACKBAR_CLOSE:
      return _.mapKeys(
        _.cloneDeep(Object.values(state)).map(noti =>
          ({...noti, dismissed: action.payload.dismissAll || noti.key === action.payload.key})
        ),
        noti => noti.key)

    case ActionTypes.SNACKBAR_REMOVE:
      return _.mapKeys(
        _.cloneDeep(Object.values(state)).filter(noti => noti.key !== action.payload.key),
        noti => noti.key)

    default:
      return state;
  }
};
