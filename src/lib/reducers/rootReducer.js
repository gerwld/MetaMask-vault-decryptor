const initialState = {
 nonce: 0,
};

const rootReducer = (state = initialState, action) => {
 if (action.type === 'INCREMENT_NONCE') {
  return {
   ...state,
   nonce: state.nonce + 1,
  };
 }
 return state;
};

export default rootReducer;
