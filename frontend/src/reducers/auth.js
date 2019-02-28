import ActionTypes from '../actions/types';

const InitialState = {
  token: localStorage.getItem('auth') || '',
  is_authenticated: localStorage.hasOwnProperty('auth'),
}

const persistPayloadIntoLocalStorage = (action) => {
  localStorage.setItem('auth', action.payload.token);
}

const clearPayloadOutOfLocalStorage = () => {
  localStorage.removeItem('auth');
}

/**
 * This reducer contain side effects that will persist
 * payload into localStore
 */
const auth = (state = InitialState, action) => {
  switch (action.type) {
    case ActionTypes.AUTH_SIGN_IN:
      persistPayloadIntoLocalStorage(action);
      return {
        token: action.payload.token,
        is_authenticated: true,
      }
    case ActionTypes.AUTH_SIGN_OUT:
      clearPayloadOutOfLocalStorage();
      return {
        is_authenticated: false,
        token: '',
      }
    default:
      return state;
  }
}

export default auth;
