import { createContext, useCallback, useReducer, useEffect } from "react";
import Web3 from 'web3';
import Web3Modal from "web3modal";

import { Web3Reducer } from "./reducer";

const initialState = {
  loading: false,
  wallet: null,
  provider: null,
  web3: null,
};

const providerOptions = {
  cacheProvider  : true, // optional
};

const web3Modal = new Web3Modal({
  providerOptions: providerOptions,
});

export const Web3Context = createContext(initialState);

export const Web3Provider = ({ children }) => {
  const [state, dispatch] = useReducer(Web3Reducer, initialState);

  const setWallet = (wallet) => {
    dispatch({
      type: "SET_WALLET",
      payload: wallet,
    });
  };

  const setProvider = (provider) => {
    dispatch({
      type: "SET_PROVIDER",
      payload: provider,
    });
  };

  const setWeb3 = (web3) => {
    dispatch({
      type: "SET_WEB3",
      payload: web3,
    });
  };

  const logout = () => {
    const { web3, provider } = state;
    if (provider.close) {
      provider.close();
    }
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      web3.currentProvider.close();
    }
    setWallet(null);
    setProvider(null);
    setWeb3(null);
  };

  const initWeb3 = (provider) => {
    const web3 = new Web3(provider);
  
    web3.eth.extend({
      methods: [
        {
          name           : 'chainId',
          call           : 'eth_chainId',
          outputFormatter: web3.utils.hexToNumber,
        },
      ],
    });
  
    return web3;
  };

  const subscribeProvider = async (data, web3Modal, web3, provider) => {
    if (!provider.on) {
      return;
    }
    provider.on('close', async () => {
      logout();
    });
    provider.on('accountsChanged', async (accounts) => {
      const { wallet } = state;
      if (!accounts[0]) {
        logout();
      } else {
        const address = accounts[0].toLowerCase();
        const balance = await web3.eth.getBalance(address);
  
        setWallet({ ...wallet, address, balance })
      }
    });
    provider.on('chainChanged', async (chainId) => {
      const { wallet } = state;
      const newChainId = await web3.eth.chainId();
      const balance = await web3.eth.getBalance(wallet.data.address);
      setWallet({
        ...wallet, chainId: newChainId, balance,
      });
    });
  };

  const connectWeb3 = useCallback(async () => {
    await connect();
  }, []);

  const connect = async () => {
    try {
      const provider = await web3Modal.connect();
      setProvider(provider);

      const web3 = initWeb3(provider);

      setWeb3(web3);

      const accounts = await web3.eth.getAccounts();

      const address = accounts[0].toLowerCase();

      const chainId = await web3.eth.chainId();

      const balance = await web3.eth.getBalance(address);

      const data = { address, chainId, balance };

      setWallet(data);

      subscribeProvider(data, web3Modal, web3, provider);
    } catch(e) {
      console.error(e);
      return;
    }
  }

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, []);

  return (
    <Web3Context.Provider
      value={{
        ...state,
        connectWeb3,
        logout,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
