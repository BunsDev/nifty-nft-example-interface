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
  const [tokens, setTokens] = useState([]);
  const [chainFilter, setChainFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [sort, setSort] = useState('listed_desc');

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
      sort,
      contractAddress,
      connectedChainId: chainId,
      address         : userAddress,
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

    nifty = new Nifty({ marketplace: 'test' });

    nifty.getNFTs(options).then((res) => { setTokens(res.data); })
      .catch((e) => {
        console.log('e', e);
      });
  }, [searchFilter, chainFilter, sort]);

  const list = async (token, price) => {
    nifty.initWallet(web3, Nifty.evmTypes.EVM);
    nifty.setStatusListener(
      (status) => console.log(status),
    );
    await nifty.list(token, '0.01');
  };

  const buy = (orderId) => {
    nifty.getListing(orderId).then(async (res) => {
      nifty.initWallet(web3, Nifty.evmTypes.EVM);
      nifty.setStatusListener(
        (status) => console.log(status),
      );
      await nifty.buy(res.data);
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
              name="chainList"
              form="marketplace"
              onChange={(e) => setChainFilter(e.target.value)}
              style={{ height: '30px', width: '200px', marginRight: '10px' }}
            >
              {chains.map((chain) => (
                <option key={chain.chainId} value={chain.chainId}>{chain.name}</option>
              ))}
            </select>

            <select
              id="sort"
              name="sort options"
              form="marketplace"
              onChange={(e) => setSort(e.target.value)}
              style={{ height: '30px', width: '200px', marginRight: '10px' }}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <input
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search"
              style={{ height: '30px', width: '200px', marginRight: '10px' }}
            />
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
