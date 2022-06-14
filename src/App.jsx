import { useContext, useEffect, useState } from 'react';  
import nftdaoSDK from 'nftdao-sdk';
import { Web3Context } from "./web3";
import './style.css'

const shortenAddress = (address) => address && `${address.substring(0, 5)}...${address.substring(address.length - 4, address.length)}`;

let nftdao;

const App = () => {
  const [tokens, setTokens] = useState([]);
  const { wallet, web3, provider, connectWeb3, logout } = useContext(Web3Context);

  useEffect(() => {
    nftdao = nftdaoSDK({marketplaceId: 'etoro'});
    nftdao.api.tokens.getAll({
      sort: 'listed_desc',
    }).then((res) => {
      setTokens(res.data);
    })
  }, []);

  const buy = (orderId) => {
    nftdao.api.orders.get(orderId).then(async (res) => {
      await nftdao.transactions.setWeb3(web3);
      nftdao.transactions.setStatusListener(
        (status) => console.log(status)
      );
      await nftdao.transactions.buy(res.data).then((tx) => {
        console.log('Bought!');
      }).catch((e) => {
        console.log(e.message);
      });
    })
  }

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
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
          {
            tokens.map((token) => <Token {...token} onBuy={() => buy(token.orderId)} />)
          }
        </div>
      </div>
    </div>
  );
}

const Token = ({contract, name, thumb, price, chainId, onBuy}) => (
  <div className="item" style={{border: '1px solid', padding: '10px', margin: '10px  '}}>
    <div style={{
      width: '200px',
      height: '200px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <img src={thumb} alt="" style={{maxWidth: '100%', maxHeight: '100%'}} />
    </div>
    <h3>{contract.name}</h3>
    <h5>{name}</h5>
    <p>{price}</p>
    <button onClick={() => onBuy()}>BUY</button>
  </div>
)


export default App;