import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers/rootReducer';

const store = configureStore({
 reducer: {
  rootReducer,
 },
});

export default store;

// import { configureStore } from '@reduxjs/toolkit';
// import thunkMiddleware from 'redux-thunk';
// import { createLogger } from 'redux-logger';
// import rootReducer from './reducers/rootReducer';

// const loggerMiddleware = createLogger();

// const middleware = [thunkMiddleware, loggerMiddleware];

// const store = (initialState) => {
//  const store = configureStore({
//   reducer: rootReducer,
//   preloadedState: initialState,
//  });
//  return store;
// };

// export default store;
