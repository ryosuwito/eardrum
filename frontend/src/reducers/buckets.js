import _ from 'lodash';

import ActionTypes from '../actions/types';


const buckets = (state = {}, action) => {
  switch (action.type) {
    case ActionTypes.BUCKET_FETCH_ALL:
      return _.mapKeys(action.payload, bucket => bucket.id);
    default:
      return state;
  }
}


export default buckets;
