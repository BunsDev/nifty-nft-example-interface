import { useContext, useEffect, useState } from 'react';
import Nifty from 'nifty-protocol';
import { useParams } from 'react-router-dom';
import { Web3Context } from '../web3';
import Token from './Token';

const shortenAddress = (address) => address && `${address.substring(0, 5)}...${address.substring(address.length - 4, address.length)}`;
let nifty;

const chains = [
  { chainId: '', name: 'All' },
  { chainId: '1', name: 'Ethereum' },
  { chainId: '137', name: 'Polygon' },
  { chainId: '56', name: 'BNB' },
  { chainId: '43114', name: 'Avalanche' },
  { chainId: '1285', name: 'Moonriver' },
  { chainId: '4', name: 'Rinkeby' },
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
  const [nfts, setNfts] = useState([]);
  const [isChainIdRequired, setIsChainIdRequired] = useState(false);

  const {
    provider,
    logout,
    web3,
    wallet,
    connectWeb3,
  } = useContext(Web3Context);

  useEffect(() => {
    const options = {
      sort           : queryParams.get('sort') || 'listed_desc',
      contractAddress: queryParams.get('contractAddress'),
    };

    if (queryParams.get('userAddress')) {
      options.address = queryParams.get('userAddress').toLowerCase();
    }
    if (queryParams.get('chainId')) {
      options.connectedChainId = queryParams.get('chainId');
    }
    if (queryParams.get('chain')) {
      options.chains = [queryParams.get('chain')];
    }
    if (queryParams.get('search')) {
      options.search = queryParams.get('search');
    }

    nifty = new Nifty({ key: 'test', env: Nifty.envs.TESTNET });

    nifty.getNFTs(options)
      .then((res) => setNfts(res))
      .catch((e) => {
        console.log('e', e);
      });
  }, []);

  return (
    <div>
      <header>
        {wallet ? shortenAddress(wallet.address)
          : (
            <button type="button" onClick={connectWeb3}>
              Connect to MetaMask
            </button>
          )}
      </header>

      <div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <form name="marketplace" id="marketplace">
            <select
              id="chains"
              name="chain"
              form="marketplace"
              defaultValue={queryParams.get('chain') || 'All'}
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
              defaultValue={queryParams.get('sort') || 'listed_desc'}
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
              defaultValue={queryParams.get('search')}
              form="marketplace"
              style={{ height: '30px', width: '200px', marginRight: '10px' }}
            />

            <input
              id="userAddress"
              name="userAddress"
              placeholder="User Address"
              defaultValue={queryParams.get('userAddress')}
              form="marketplace"
              onChange={(e) => setIsChainIdRequired(!!e.target.value)}
              style={{ height: '30px', width: '200px', marginRight: '10px' }}
            />

            <input
              id="contractAddress"
              name="contractAddress"
              placeholder="Contract Address"
              defaultValue={queryParams.get('contractAddress')}
              form="marketplace"
              onChange={(e) => setIsChainIdRequired(!!e.target.value)}
              style={{ height: '30px', width: '200px', marginRight: '10px' }}
            />

            {
            (isChainIdRequired || queryParams.get('chainId')) && (
            <input
              id="chainId"
              name="chainId"
              required={isChainIdRequired}
              defaultValue={queryParams.get('chainId')}
              placeholder="chainId"
              form="marketplace"
              style={{ height: '30px', width: '200px', marginRight: '10px' }}
            />
            )
            }
            <button type="submit">submit</button>
          </form>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {nfts.map((nft) => (
            // nft preview
            <Token
              key={nft.id}
              {...nft}
            />
          ))}
        </div>
      </div>

    </div>
  );
};

export default Marketplace;
