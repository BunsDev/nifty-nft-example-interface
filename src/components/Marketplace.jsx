import { useContext, useEffect, useState } from 'react';
import Nifty from 'nifty-protocol';
import { useParams } from 'react-router-dom';
import { Web3Context } from '../web3';
import Token from './Token';

const shortenAddress = (address) => address && `${address.substring(0, 5)}...${address.substring(address.length - 4, address.length)}`;
let nifty;

const chains = [
  { chainId: '', name: 'All' },
  { chainId: 1, name: 'Ethereum' },
  { chainId: 137, name: 'Polygon' },
  { chainId: 56, name: 'BNB' },
  { chainId: 43114, name: 'Avalanche' },
  { chainId: 1285, name: 'Moonriver' },
  { chainId: 4, name: 'rinkeby' },
];

const sortOptions = [
  { value: 'listed_desc', label: 'Recently Listed' },
  { value: 'created_desc', label: 'Recently Minted' },
  { value: 'sold_desc', label: 'Recently Sold' },
  { value: 'price_asc', label: 'Price (Lowest to highest)' },
  { value: 'price_desc', label: 'Price (Highest to lowest)' },
  { value: 'last_sell_desc', label: 'Highest Last Sale' },
];

const Marketplace = () => {
  const queryParams = new URLSearchParams(window.location.search);
  const [tokens, setTokens] = useState([]);

  const {
    contractAddress,
    chainId,
    userAddress,
  } = useParams();

  const {
    wallet,
    web3,
    provider,
    connectWeb3,
    logout,
  } = useContext(Web3Context);

  useEffect(() => {
    const options = {
      sort            : queryParams.get('sort') || 'listed_desc',
      contractAddress,
      connectedChainId: chainId,
      address         : userAddress,
    };

    if (queryParams.get('chain')) {
      options.chains = [queryParams.get('chain')];
    }
    if (queryParams.get('search')) {
      options.search = queryParams.get('search');
    }

    nifty = new Nifty({ key: 'test', env: Nifty.envs.TESTNET });

    nifty.getNFTs(options).then((res) => {
      setTokens(res.data);
    })
      .catch((e) => {
        console.log('e', e);
      });
  }, []);

  const list = async (token, price) => {
    nifty.initWallet(web3, Nifty.networkTypes.EVM);
    nifty.setStatusListener(
      (status) => console.log(status),
    );
    await nifty.list(token, '0.01');
  };

  const buy = (orderId) => {
    nifty.getListing(orderId).then(async (res) => {
      nifty.initWallet(web3, Nifty.networkTypes.EVM);
      nifty.setStatusListener(
        (status) => console.log(status),
      );
      nifty.buy(res.data).then((tx) => {
        console.log('Bought!');
      }).catch((e) => alert(e));
    });
  };

  return (
    <div>
      <header>
        {!wallet ? (
          <button type="button" onClick={connectWeb3}>
            Connect to MetaMask
          </button>
        ) : shortenAddress(wallet.address)}
      </header>

      <div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <form name="marketplace" id="marketplace">
            <select
              id="chains"
              name="chain"
              form="marketplace"
              style={{ height: '30px', width: '200px', marginRight: '10px' }}
            >
              {chains.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>{chain.name}</option>
              ))}
            </select>

            <select
              id="sort"
              name="sort"
              form="marketplace"
              style={{ height: '30px', width: '200px', marginRight: '10px' }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <input
              id="search"
              name="search"
              placeholder="Search"
              form="marketplace"
              style={{ height: '30px', width: '200px', marginRight: '10px' }}
            />
            <button type="submit">Search</button>
          </form>

          {contractAddress && (
            <>
              <p>Contact Address: </p>
              <p>{contractAddress}</p>
            </>
          )}

          {userAddress && (
            <>
              <p>User Address :</p>
              <p>{userAddress}</p>
            </>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {tokens.map((token) => (
            <Token
              {...token}
              onBuy={() => buy(token.orderId)}
              onList={() => list(token)}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Marketplace;
