import { useParams } from 'react-router-dom';
import Nifty from 'nifty-protocol';
import { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../web3';

let nifty;

const AssetToken = () => {
  const { contractAddress, chainId, nftId } = useParams();
  const { provider } = useContext(Web3Context);

  const [nft, setNft] = useState({});
  const [userAvailableMethods, setUserAvailableMethods] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState(null);

  useEffect(() => {
    nifty = new Nifty({ env: Nifty.envs.TESTNET });

    if (provider) {
      nifty.initWallet(Nifty.networkTypes.EVM, provider);
    }

    nifty.getAllNFTData(contractAddress, nftId, chainId)
      .then((res) => {
        setNft(res.nft);
        setUserAvailableMethods(res.userAvailableMethods);

        if (res.userAvailableMethods?.canSell) {
          const availableMethodsRes = nifty.getAvailablePaymentMethods(chainId);
          setPaymentMethods(availableMethodsRes);
        }
      });
  }, [provider]);

  const buy = async (nftToBuy, isExternalOrder) => {
    nifty.initWallet(Nifty.networkTypes.EVM, provider);
    nifty.setStatusListener((status) => console.log(status));

    // external orders can be looksrare / opensea / rarible
    const orderId = isExternalOrder ? nftToBuy.externalOrderId : nftToBuy.orderId;

    try {
      await nifty.buy(orderId, isExternalOrder);
    } catch (e) {
      console.error('e', e);
    }
  };

  const list = async (e, nftToSell) => {
    e.preventDefault();

    nifty.initWallet(Nifty.networkTypes.EVM, provider);
    nifty.setStatusListener((status) => console.log(status));

    const expirationTime = 86400; // in 1 day

    try {
      await nifty.list(
        nftToSell,
        e.target.price.value,
        expirationTime,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const offer = async (e, nftToBuy) => {
    e.preventDefault();

    nifty.initWallet(Nifty.networkTypes.EVM, provider);
    nifty.setStatusListener((status) => console.log(status));

    const expirationTime = 86400; // in 1 day

    try {
      nifty.offer(
        nftToBuy,
        e.target.price.value,
        expirationTime,
      );
    } catch (error) {
      console.error(error);
    }
  };

  const cancelOrder = async (nftToCancel) => {
    nifty.initWallet(Nifty.networkTypes.EVM, provider);
    nifty.setStatusListener((status) => console.log(status));

    try {
      await nifty.cancelOrder(nftToCancel.orderId);
    } catch (error) {
      console.error(error);
    }
  };

  if (!nft) return <></>;

  return (
    <div>
      <img src={nft.preview} alt={nft.name} style={{ maxWidth: '300px', maxHeight: '300px' }} />
      <h1>{nft.contractName}</h1>
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
        {userAvailableMethods?.canSell
          && (
            <form onSubmit={(e) => { list(e, nft); }}>
              <input
                name="price"
                placeholder="price"
                style={{ height: '30px', width: '200px', marginRight: '10px' }}
              />

              {
                paymentMethods && (
                  <select
                    defaultValue={paymentMethods[0].value}
                    name="paymentMethod"
                    style={{ height: '30px', width: '200px', marginRight: '10px' }}
                  >
                    {paymentMethods.map((option) => (
                      <option key={option.address} value={option.address}>{option.value}</option>
                    ))}
                  </select>
                )
              }
              <button type="submit">List for sale</button>
            </form>
          )}
        {
          userAvailableMethods?.canOffer
          && (
            <form onSubmit={(e) => { offer(e, nft); }}>
              <input
                name="price"
                placeholder="price"
                style={{ height: '30px', width: '200px', marginRight: '10px' }}
              />
              <button type="submit">offer</button>
            </form>

          )
        }
        {userAvailableMethods?.canBuy && <button onClick={() => buy(nft, false)} type="button">Buy</button>}
        {userAvailableMethods?.canCancel && <button onClick={() => cancelOrder(nft)} type="button">Cancel Listing</button>}
        {!!nft.externalOrderPrice && <button onClick={() => buy(nft, true)} type="button">External Buy</button>}
      </div>

      <div>
        {!!nft.attributes?.length && (
          <>
            <h2>Attributes:</h2>
            {
              nft.attributes.map((attribute) => (
                <div key={`${attribute.trait_type}_${attribute.value}`}>
                  {attribute.trait_type}
                  :
                  {attribute.value}
                </div>
              ))
            }
          </>
        )}
      </div>
    </div>
  );
};

export default AssetToken;
