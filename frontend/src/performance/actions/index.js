import axios from 'axios';

import urls from './urls';
import ActionTypes from './types';
import { API_MESSAGES } from './constants';
import { callAPI } from '../../actions/index';

export const requestFetchAll = () => {
  return callAPI(axios.get(urls.REQUEST_FETCH_ALL), ActionTypes.REQUEST_FETCH_ALL);
};

export const requestFetchOne = (id) => {
  return callAPI(axios.get(urls.REQUEST_FETCH_ONE(id)), ActionTypes.REQUEST_FETCH_ONE);
};

export const requestSendReview = (id, review) => {
  return callAPI(
    axios.patch(urls.REQUEST_SEND_REVIEW(id), { review }),
    ActionTypes.REQUEST_FETCH_ONE,
    API_MESSAGES.REQUEST_SEND_REVIEW,
    API_MESSAGES.REQUEST_SEND_REVIEW_ERROR
  );
};
