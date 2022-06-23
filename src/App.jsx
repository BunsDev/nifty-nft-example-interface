import './style.css';
import {
  BrowserRouter as Router,
  Switch,
  HashRouter,
  Route,
} from 'react-router-dom';
import Marketplace from './components/Marketplace';
import AssetToken from './components/AssetToken';

const App = () => (
  <HashRouter>
    <Switch>
      <Route path="/user/:chainId/:userAddress">
        <Marketplace />
      </Route>
      <Route path="/token/:chainId/:contractAddress/:NFTId">
        <AssetToken />
      </Route>
      <Route path="/collection/:chainId/:contractAddress">
        <Marketplace />
      </Route>
      <Route path="/">
        <Marketplace />
      </Route>
    </Switch>
  </HashRouter>
);

export default App;
