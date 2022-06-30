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
  <Router>
    <Switch>
      <Route path="/user/:chainId/:userAddress">
        <Marketplace />
      </Route>
      <Route path="/token/:chainId/:contractAddress/:nftId">
        <AssetToken />
      </Route>
      <Route path="/collection/:chainId/:contractAddress">
        <Marketplace />
      </Route>
      <Route path="/">
        <Marketplace />
      </Route>
    </Switch>
  </Router>
);

export default App;
