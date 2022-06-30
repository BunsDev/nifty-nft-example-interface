import {
  Link,
  useParams,
} from 'react-router-dom';
import Nifty from 'nifty-protocol';

import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../web3';

let nifty;

const AssetToken = () => {
  const { contractAddress, chainId, NftId } = useParams();
  const { web3 } = useContext(Web3Context);

  const [nft, setNft] = useState([]);
  const [NftData, setNftData] = useState([]);
  const [userActions, setUserActions] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState(null);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    nifty = new Nifty({ key: 'test', env: Nifty.envs.LOCAL });

    nifty.getNFT(contractAddress, NftId, chainId).then((res) => {
      setNft(res);
      nifty.getNFTData(res).then((nftRes) => {
        setNftData(nftRes);
      });
    });
  }, []);

  useEffect(() => {
    if (web3 && NftData && !userActions) {
      nifty.initWallet(web3, Nifty.networkTypes.EVM);
      nifty.getUserAvailableMethods(NftData.listings, nft).then((res) => {
        setUserActions(res);

        //  if user is owner of the NFT
        if (res.canSell) {
          const availableMethodsRes = nifty.getAvailablePaymentMethods(chainId);
          setPaymentMethods(availableMethodsRes);
        }
      })
        .catch((e) => {
          console.log('e', e);
        });
    }
  }, [web3, NftData.listings]);

  const buy = async (nftToBuy, isExternalOrder) => {
    // external roder can be looksrare / opensea / rarible
    const listingRes = await nifty.getListing(nftToBuy.externalOrderId, isExternalOrder);

    nifty.initWallet(web3, Nifty.networkTypes.EVM);
    nifty.setStatusListener((status) => console.log(status));

    try {
      const res = await nifty.buy(listingRes.data, isExternalOrder);
      console.log('res', res);
    } catch (e) {
      console.error('e', e);
    }
  };

  const sell = async (nftToSell) => {
    nifty.initWallet(web3, Nifty.networkTypes.EVM);
    nifty.setStatusListener((status) => console.log(status));

    const expirationTime = 86400; // 1 day

    try {
      const res = await nifty.sell(nftToSell, price, expirationTime);
      console.log('res', res);
    } catch (e) {
      console.error('e', e);
    }
  };

  return (
    <div>
      {
        nft && (
          <>
            <img src={nft.preview} alt={nft.name} style={{ maxWidth: '300px', maxHeight: '300px' }} />
            <Link to={`/collection/${chainId}/${contractAddress}`}>
              <h1>{nft.contractName}</h1>
            </Link>
            <h2>{nft.name}</h2>

            {
              nft.price && (
                <h3>
                  Price:
                  {nft.price}
                </h3>
              )
            }

            {
              nft.externalOrderPrice && (
                <h3>
                  External Order Price:
                  {nft.externalOrderPrice}
                </h3>
              )
            }

            <h5>
              Description:
              {nft.description}
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
                    <button onClick={() => sell(nft)} type="button">List</button>
                  </>
                )}
              {userActions?.canBuy && <button onClick={() => buy(nft, false)} type="button">Buy</button>}
              {nft.externalOrderPrice && <button onClick={() => buy(nft, true)} type="button">External Buy</button>}
            </div>

            <div>
              {nft.attributes && (
                <>
                  <h2>Attributes:</h2>
                  {
                    nft.attributes.map((attribute) => (
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
