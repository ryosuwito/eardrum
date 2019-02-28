import ActionTypes from '../actions/types';
import _ from 'lodash';


const questions = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.QUESTION_FETCH_ALL:
      return _.mapKeys(action.payload, question => question.id);
    default:
      return state;
  }
}


export default questions;
