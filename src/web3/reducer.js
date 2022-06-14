export const Web3Reducer = (state, action) => {
    switch (action.type) {
      case "SET_WALLET":
        return {
          ...state,
          wallet: action.payload,
        };
      case "SET_PROVIDER":
        return {
          ...state,
          provider: action.payload,
        };
      case "SET_WEB3":
        return {
          ...state,
          web3: action.payload,
        };
      default:
        return state;
    }
  };