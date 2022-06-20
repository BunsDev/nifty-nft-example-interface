import {
  useParams,
} from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import nftdaoSDK from 'nftdao-sdk';
import Token from './Token';
import { Web3Context } from '../web3';

const shortenAddress = (address) => address && `${address.substring(0, 5)}...${address.substring(address.length - 4, address.length)}`;

let nftdao;

const sortOptions = [
  { value: 'listed_desc', label: 'Recently Listed' },
  { value: 'created_desc', label: 'Recently Minted' },
  { value: 'sold_desc', label: 'Recently Sold' },
  { value: 'price_asc', label: 'Price (Lowest to highest)' },
  { value: 'price_desc', label: 'Price (Highest to lowest)' },
  { value: 'last_sell_desc', label: 'Highest Last Sale' },
];

const Collection = () => {
  const { contractAddress, chainId } = useParams();
  const [tokens, setTokens] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [sort, setSort] = useState('listed_desc');
  const { wallet, connectWeb3 } = useContext(Web3Context);

  useEffect(() => {
    const options = {
      sort,
      contractAddress,
      connectedChainId: chainId,
    };

    if (sort) {
      options.sort = sort;
    }
    if (searchFilter) {
      options.search = searchFilter;
    }

    nftdao = nftdaoSDK({ marketplaceId: 'etoro' });

    nftdao.api.tokens.getAll(options).then((res) => {
      setTokens(res.data);
    });
  }, [searchFilter, sort]);

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
        <h2>
          collection:
          {contractAddress}
        </h2>

        <form name="Collection" id="collection">
          <select id="sort" name="sort options" form="collection" onChange={(e) => setSort(e.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          <input onChange={(e) => setSearchFilter(e.target.value)} />
        </form>

        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {tokens.map((token) => <Token {...token} />)}
        </div>

      </div>
    </div>
  );
};

export default Collection;
