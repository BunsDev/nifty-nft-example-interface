import {
  useParams,
} from 'react-router-dom';
import nftdaoSDK from 'nftdao-sdk';
import { useEffect, useState } from 'react';
import Token from './Token';

let nftdao;

const User = () => {
  const { userAddress, chainId } = useParams();
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    nftdao = nftdaoSDK({ marketplaceId: 'etoro' });
    nftdao.api.tokens.getAll({ address: userAddress, connectedChainId: chainId }).then((res) => {
      setTokens(res.data);
    });
  }, []);

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
        {tokens.map((token) => <Token {...token} />)}
      </div>
    </div>
  );
};

export default User;
