import {
  Link,
  useParams,
} from 'react-router-dom';
import Nifty from 'nifty-protocol';

import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../web3';

let nifty;

const AssetToken = () => {
  const { contractAddress, chainId, NFTId } = useParams();
  const [NFT, setNFT] = useState([]);
  const [NFTData, setNFTNFTData] = useState([]);
  const [userActions, setUserActions] = useState({});
  const [price, setPrice] = useState(0);
  const { web3 } = useContext(Web3Context);

  useEffect(() => {
    nifty = new Nifty({ key: 'test', env: Nifty.envs.TESTNET });

    nifty.getNFT(contractAddress, NFTId, chainId).then((res) => {
      setNFT(res.data);
      nifty.getNFTData(res.data).then((nftRes) => {
        setNFTNFTData(nftRes.data);
      });
    });
  }, []);

  useEffect(() => {
    if (web3 && NFTData && setUserActions !== {}) {
      nifty.initWallet(web3, Nifty.networkTypes.EVM);
      nifty.getUserAvailableMethods(NFTData.listings, NFT).then((res) => {
        setUserActions(res);
      })
        .catch((e) => {
          console.log('e', e);
        });
    }
  }, [web3, NFTData.listings]);

  const buy = (orderId) => {
    nifty.getListing(orderId).then(async (res) => {
      nifty.initWallet(web3, Nifty.networkTypes.EVM);
      nifty.setStatusListener(
        (status) => console.log(status),
      );
      await nifty.buy(res.data);
    });
  };

  const offer = () => {
    console.log('offer');
  };

  const sell = async (NFT) => {
    nifty.initWallet(web3, Nifty.networkTypes.EVM);
    nifty.setStatusListener(
      (status) => console.log(status),
    );
    const orderRes = await nifty.sell(NFT, price);
  };

  return (
    <div>
      {
        NFT && (
          <>
            <img src={NFT.preview} alt={NFT.name} style={{ maxWidth: '300px', maxHeight: '300px' }} />
            <Link to={`/collection/${chainId}/${contractAddress}`}>
              <h1>{NFT.contractName}</h1>
            </Link>
            <h2>{NFT.name}</h2>
            <h3>
              Price:
              {NFT.price}
            </h3>
            <h5>
              Description:
              {NFT.description}
            </h5>

            <div>

              {userActions?.canSell
              && (
              <>
                <input
                  id="price"
                  name="price"
                  placeholder="price"
                  form="nft price"
                  style={{ height: '30px', width: '200px', marginRight: '10px' }}
                  onChange={(e) => { setPrice(e.target.value); }}
                />
                <button onClick={() => sell(NFT)} type="button">List</button>
              </>
              )}
              {userActions?.canBuy && <button onClick={() => buy(NFT.orderId)} type="button">Buy</button>}
            </div>

            <div>
              {NFT.attributes && (
                <>
                  <h2>Attributes:</h2>
                  {
                    NFT.attributes.map((attribute) => (
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
