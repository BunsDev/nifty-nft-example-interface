import { Link } from 'react-router-dom';
import nftdaoSDK from 'nftdao-sdk';

let nftdao;

const Token = ({
  contract, name, thumb, price, chainId, onBuy, tokenID,
}) => {
  nftdao = nftdaoSDK({ marketplaceId: 'etoro' });
  const chain = chainId && nftdao.findChain(chainId);

  return (
    <div
      className="item"
      style={{
        border: '1px solid', padding: '10px', margin: '10px', alignItems: 'center',
      }}
    >
      <Link to={`/token/${chainId}/${contract.address}/${tokenID}`} style={{ color: 'black' }}>
        <div style={{
          width         : '200px',
          height        : '200px',
          display       : 'flex',
          justifyContent: 'center',
          alignItems    : 'center',
        }}
        >
          <img src={thumb} alt="" style={{ maxWidth: '200px', maxHeight: '200px' }} />
        </div>
        <h3 style={{
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '200px',
        }}
        >
          {contract.name}
        </h3>
        <h5 style={{
          textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '200px',
        }}
        >
          {name}
        </h5>
        <p>{price}</p>
        <p>{chain.name}</p>
      </Link>
    </div>
  );
};
export default Token;
