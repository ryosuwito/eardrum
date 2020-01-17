import axios from 'axios';
import React from 'react';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';


import urls from './urls';
import ActionTypes from './types';
import { API_MESSAGES } from './constants';


const callAPI = (axiosRequest, actionType, successMessage = null, errorMessage = null) => {
  return async (dispatch) => {
    try {
      const payload = (await axiosRequest).data;
      console.log(payload);
      if (typeof(actionType) === 'string') {
        dispatch({ type: actionType, payload })
        if (successMessage !== null) {
          dispatch(enqueueSnackbar({
            message: successMessage,
            options: {
              key: ActionTypes.API_CALL_SUCCESS + Math.random(),
              variant: 'success',
              action: key => (
                <IconButton onClick={() => dispatch(closeSnackbar(key))}><CloseIcon /></IconButton>
              )
            }
          }))
        }
      } else {
        console.error("Undefined 'actionType'", actionType);
      }
      return true;
    } catch(err) {
      console.error(err);
      if (errorMessage !== null) {
        dispatch(enqueueSnackbar({
          message: `${errorMessage}: ${err.message}`,
          options: {
            key: ActionTypes.API_CALL_ERROR + Math.random(),
            variant: 'error',
            action: key => (
              <IconButton onClick={() => dispatch(closeSnackbar(key))}><CloseIcon /></IconButton>
            )
          }
        }))
      }
      return false;
    }
  }
}


/** START NOTIFICATION */
export const enqueueSnackbar = notification => {
  const key = notification.options && notification.options.key;

  return {
    type: ActionTypes.SNACKBAR_ENQUEUE,
    payload: {
      ...notification,
      key: key || new Date().getTime() + Math.random(),
    },
  };
};

export const closeSnackbar = key => ({
    type: ActionTypes.SNACKBAR_CLOSE,
    payload: {
      dismissAll: !key, // dismiss all if no key has been defined
      key,
    }
});

export const removeSnackbar = key => ({
    type: ActionTypes.SNACKBAR_REMOVE,
    payload: {
      key,
    }
});
/** END NOTIFICATION */


/** START AUTHENTICATION ACTIONS */
export const signIn = ({ username, password }) => {
  let data = { username, password };
  let axiosRequest = axios.post(urls.SIGN_IN, data);
  return callAPI(
    axiosRequest,
    ActionTypes.AUTH_SIGN_IN,
    API_MESSAGES.AUTH_SIGN_IN,
    API_MESSAGES.AUTH_SIGN_IN_ERROR,
  );
}


export const signOut = () => {
  return callAPI(
    {
      data: {
        payload: '',
      },
    },
    ActionTypes.AUTH_SIGN_OUT,
    API_MESSAGES.AUTH_SIGN_OUT,
  )
}
/** END AUTHENTICATION ACTIONS */


/** START REQUEST ACTIONS */
export const requestFetchAll = () => {
  return callAPI(
    axios.get(urls.REQUEST_FETCH_ALL),
    ActionTypes.REQUEST_FETCH_ALL,
  )
}

export const requestFetchOne = (id) => {
  return callAPI(
    axios.get(urls.REQUEST_FETCH_ONE(id)),
    ActionTypes.REQUEST_FETCH_ONE,
  )
}

export const requestSendReview = (id, review) => {
  return callAPI(
    axios.patch(urls.REQUEST_SEND_REVIEW(id), { review }),
    ActionTypes.REQUEST_FETCH_ONE,
    API_MESSAGES.REQUEST_SEND_REVIEW,
    API_MESSAGES.REQUEST_SEND_REVIEW_ERROR,
  )
}
/** END REQUEST ACTIONS */


/** START CONFIG ACTIONS */
export const configFetchGradeOptions = () => {
  return callAPI(
    axios.get(urls.CONFIG_FETCH_GRADE_OPTIONS),
    ActionTypes.CONFIG_FETCH_GRADE_OPTIONS,
  )
}
/** END CONFIG ACTIONS */


/** START OKR ACTIONS */
export const okrFetchAll = () => {
  return callAPI(
    axios.get(urls.OKR_FETCH_ALL),
    ActionTypes.OKR_FETCH_ALL,
  )
}

export const okrFetchOne = (id) => {
  return callAPI(
    axios.get(urls.OKR_FETCH_ONE(id)),
    ActionTypes.OKR_FETCH_ONE,
    null,
    API_MESSAGES.OKR_FETCH_ONE_ERROR,
  )
}

export const onSaveOKR = async (id, okr) => {
  return callAPI(
    await axios.patch(urls.OKR_DETAIL_URL(id), { ...okr }),
    ActionTypes.OKR_FETCH_ONE,
    API_MESSAGES.ON_SAVE_OKR,
    API_MESSAGES.ON_SAVE_OKR_ERROR,
  )
}

export const onCreateOKR = async (okr) => {
  return callAPI(
    await axios.post(urls.OKR_DETAIL_URL(), { ...okr }),
    ActionTypes.OKR_FETCH_ONE,
    API_MESSAGES.ON_CREATE_OKR,
    API_MESSAGES.ON_CREATE_OKR_ERROR,
  )
}

export const onDeleteOKR = async (id) => {
  return callAPI(
    await axios.delete(urls.OKR_DETAIL_URL(id)),
    null,
    API_MESSAGES.ON_DELETE_OKR,
  )
}
/** END OKR ACTIONS */

/** START ACCOUNT ACTIONS */
export const accountFetchAll = () => {
  return callAPI(
    axios.get(urls.USER_FETCH_ALL),
    ActionTypes.USER_FETCH_ALL,
  )
}

export const getCurrentUser = () => {
  return callAPI(
    axios.get(urls.GET_CURRENT_USER),
    ActionTypes.GET_CURRENT_USER,
  )
}

/** END ACCOUNT ACTIONS */

