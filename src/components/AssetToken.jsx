import {
  Link,
  useParams,
} from 'react-router-dom';
import nftdaoSDK from 'nftdao-sdk';
import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../web3';

let nftdao;

const AssetToken = () => {
  const { contractAddress, chainId, tokenID } = useParams();
  const [token, setToken] = useState([]);
  const [canList, setCanList] = useState(false);
  const { web3 } = useContext(Web3Context);

  useEffect(() => {
    nftdao = nftdaoSDK({ marketplaceId: 'etoro' });
    nftdao.api.tokens.get(contractAddress, tokenID, { chainId }).then((res) => {
      setToken(res.data);
    });
  }, []);

  useEffect(() => {
    if (token) {
      nftdao.setWeb3(web3, 'EVM').then(() => {
        nftdao.transactions.canList(token.contract.address, token.tokenID, token.contractType).then((res) => {
          setCanList(res);
        }).catch((e) => {
          console.log('e', e);
        });
      }).catch((e) => {
        console.log('e', e);
      });
    }
  }, [web3, token]);

  const buy = (orderId) => {
    nftdao.api.orders.get(orderId).then(async (res) => {
      nftdao.setWeb3(web3, 'EVM').then(async () => {
        await nftdao.transactions.buy(res.data).then((tx) => {
          console.log('Bought!');
        })
          .catch((e) => { console.log(e.message); });
      })
        .catch((e) => {
          console.log('e', e);
        });
      nftdao.transactions.setStatusListener(
        (status) => console.log(status),
      );
    });
  };

  const offer = () => {
    console.log('offer');
  };

  const list = () => {
    console.log('list');
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
