export const logger = store => next => action => {
  // console.log('dispatching', action);
  let result = next(action);
  // console.log('next state', store.getState());
  return result;
}

function createThunkMiddleware(extraArgument) {
  return ({ dispatch, getState }) => next => action => {
    if (typeof action === 'function') {
      // console.log('---------------')
      // console.log(action);
      return action(dispatch, getState, extraArgument);
    }

    return next(action);
  };
}

export const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;


export default [logger, thunk];
