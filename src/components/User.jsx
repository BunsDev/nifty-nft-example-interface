import {
  useParams,
} from 'react-router-dom';
import Nifty from 'nifty-protocol';
import { useContext, useEffect, useState } from 'react';
import Token from './Token';
import { Web3Context } from '../web3';

let nifty;

const User = () => {
  const { userAddress, chainId } = useParams();
  const [tokens, setTokens] = useState([]);
  const {
    wallet, web3, provider, connectWeb3, logout,
  } = useContext(Web3Context);
  useEffect(() => {
    nifty = new Nifty({ marketplace: 'test' });

    nifty.getNFTs({ address: userAddress, connectedChainId: chainId }).then((res) => {
      setTokens(res.data);
    });
  }, []);

  const sell = async (token) => {
    nifty.initWallet(web3, 'EVM');
    nifty.setStatusListener(
      (status) => console.log(status),
    );
    await nifty.sell(token, '0.01');
  };

  return (
    <div>
      <h4>
        user address:
        {userAddress}
      </h4>
      <h4>
        chain:
        {chainId}
      </h4>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {tokens.map((token) => <Token {...token} onSell={() => sell(token)} />)}
      </div>
    </div>
  );
};

export default User;
