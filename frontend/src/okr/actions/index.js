import axios from 'axios';

import url from './url';
import ActionTypes from './types';
import { API_MESSAGES } from './constants';
import { callAPI } from '../../actions/index';

export const okrFetchAll = () => {
  return callAPI(axios.get(url.OKR_FETCH_ALL), ActionTypes.OKR_FETCH_ALL);
};

export const okrFetchOne = (id) => {
  return callAPI(axios.get(url.OKR_FETCH_ONE(id)), ActionTypes.OKR_FETCH_ONE, null, API_MESSAGES.OKR_FETCH_ONE_ERROR);
};

export const onSaveOKR = async (id, okr) => {
  return callAPI(
    await axios.patch(url.OKR_DETAIL_URL(id), { ...okr }),
    ActionTypes.OKR_FETCH_ONE,
    API_MESSAGES.ON_SAVE_OKR,
    API_MESSAGES.ON_SAVE_OKR_ERROR
  );
};

export const onCreateOKR = async (okr) => {
  return callAPI(
    await axios.post(url.OKR_DETAIL_URL(), { ...okr }),
    ActionTypes.OKR_FETCH_ONE,
    API_MESSAGES.ON_CREATE_OKR,
    API_MESSAGES.ON_CREATE_OKR_ERROR
  );
};

export const onDeleteOKR = async (id) => {
  return callAPI(await axios.delete(url.OKR_DETAIL_URL(id)), null, API_MESSAGES.ON_DELETE_OKR);
};

export const onCreateOKRFile = async (okrFile, okr_id) => {
  const formData = new FormData();
  formData.append('file',okrFile)
  formData.append('okr',okr_id)

  return callAPI(
    await axios.post(url.OKR_FILE_DETAIL_URL(), formData),
    ActionTypes.OKR_FILE_FETCH_ONE,
    API_MESSAGES.ON_CREATE_FILE,
    API_MESSAGES.ON_CREATE_FILE_ERROR
  );
};