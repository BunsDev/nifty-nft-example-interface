import { useContext, useEffect, useState } from 'react';
import nftdaoSDK from 'nftdao-sdk';
import { Web3Context } from '../web3';
import Token from './Token';

const shortenAddress = (address) => address && `${address.substring(0, 5)}...${address.substring(address.length - 4, address.length)}`;

let nftdao;

const chains = [
  { chainId: '', name: 'All' },
  { chainId: 1, name: 'Ethereum' },
  { chainId: 137, name: 'Polygon' },
  { chainId: 56, name: 'BNB' },
  { chainId: 43114, name: 'Avalanche' },
  { chainId: 1285, name: 'Moonriver' },
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
  const [tokens, setTokens] = useState([]);
  const [chainFilter, setChainFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [sort, setSort] = useState('listed_desc');
  const {
    wallet, web3, provider, connectWeb3, logout,
  } = useContext(Web3Context);

  useEffect(() => {
    const options = {
      sort,
    };

    if (sort) {
      options.sort = sort;
    }
    if (chainFilter) {
      options.chains = [chainFilter];
    }
    if (searchFilter) {
      options.search = searchFilter;
    }

    nftdao = nftdaoSDK({ marketplaceId: 'etoro' });

    nftdao.api.tokens.getAll(
      options,
    ).then((res) => {
      setTokens(res.data);
    });
  }, [searchFilter, chainFilter, sort]);

  const buy = (orderId) => {
    nftdao.api.orders.get(orderId).then(async (res) => {
      await nftdao.setWeb3(web3, 'EVM');
      nftdao.transactions.setStatusListener((status) => console.log(status));

      await nftdao.transactions.buy(res.data).then((tx) => {
        console.log('Bought!');
      }).catch((e) => { console.log(e.message); });
    });
  };

  return (
    <div>
      <header>
        {!wallet ? (
          <button onClick={connectWeb3}>
            Connect to MetaMask
          </button>
        ) : shortenAddress(wallet.address)}
      </header>
      <div>
        <div>
          <form name="marketplace" id="marketplace">

            <select id="chains" name="chainList" form="marketplace" onChange={(e) => setChainFilter(e.target.value)}>
              {chains.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>{chain.name}</option>
              ))}
            </select>

            <select id="sort" name="sort options" form="marketplace" onChange={(e) => setSort(e.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <input onChange={(e) => setSearchFilter(e.target.value)} />
          </form>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {tokens.map((token) => <Token {...token} onBuy={() => buy(token.orderId)} />)}
        </div>

      </div>
    </div>
  );
};

export default Marketplace;
