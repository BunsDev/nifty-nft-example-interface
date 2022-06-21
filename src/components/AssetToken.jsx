import {
  Link,
  useParams,
} from 'react-router-dom';
import Nifty from 'nifty-protocol';

import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../web3';

let nifty;

const AssetToken = () => {
  const { contractAddress, chainId, tokenID } = useParams();
  const [token, setToken] = useState([]);
  const [canList, setCanList] = useState(false);
  const { web3 } = useContext(Web3Context);

  useEffect(() => {
    nifty = new Nifty({ marketplace: 'test' });
    nifty.getNFT(contractAddress, tokenID, chainId).then((res) => {
      setToken(res.data);
    });
  }, []);

  const buy = (orderId) => {
    nifty.getListing(orderId).then(async (res) => {
      nifty.initWallet(web3, Nifty.evmTypes.EVM);
      nifty.setStatusListener(
        (status) => console.log(status),
      );
      await nifty.buy(res.data);
    });
  };

  const offer = () => {
    console.log('offer');
  };

  const list = async (token, price) => {
    nifty.initWallet(web3, Nifty.evmTypes.EVM);
    nifty.setStatusListener(
      (status) => console.log(status),
    );
    await nifty.list(token, '0.01');
  };

  return (
    <div>
      {
        token && (
          <>
            <img src={token.preview} alt={token.name} style={{ maxWidth: '300px', maxHeight: '300px' }} />
            <Link to={`/collection/${chainId}/${contractAddress}`}>
              <h1>{token.contractName}</h1>
            </Link>
            <h2>{token.name}</h2>
            <h3>
              Price:
              {token.price}
            </h3>
            <h5>
              Description:
              {token.description}
            </h5>

            <div>
              {canList && <button onClick={list} type="button">List</button>}
              <button onClick={buy} type="button">Buy</button>
              <button onClick={offer} type="button">Offer</button>
            </div>

            <div>
              {token.attributes && (
                <>
                  <h2>Attributes:</h2>
                  {
                    token.attributes.map((attribute) => (
                      <div>
                        {attribute.trait_type}
                        :
                        {attribute.value}
                      </div>
                    ))
                }
                </>
              )}
            </div>
          </>
        )
}
    </div>
  );
};

export default AssetToken;
