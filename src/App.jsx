import { useContext, useEffect, useState } from 'react';
import nftdaoSDK from 'nftdao-sdk';
import { Web3Context } from "./web3";
import './style.css'
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Marketplace from './components/Marketplace';
import User from './components/User';
import AssetToken from './components/AssetToken';
import Collection from './components/Collection';


const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/user/:chainId/:userAddress">
         <User />
        </Route>
        <Route path="/token/:chainId/:contractAddress/:tokenID">
         <AssetToken />
        </Route>
        <Route path="/collection/:chainId/:contractAddress">
         <Collection/>
        </Route>
   
        <Route path="/">
          <Marketplace />
        </Route>
      </Switch>
    </Router>
  )
}

export default App;

