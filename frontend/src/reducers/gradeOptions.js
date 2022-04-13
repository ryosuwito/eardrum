import ActionTypes from '../actions/types';


export default (state = [], action) => {
  switch(action.type) {
    case ActionTypes.CONFIG_FETCH_GRADE_OPTIONS: 
      return action.payload;
    default:
      return state;
  }
}