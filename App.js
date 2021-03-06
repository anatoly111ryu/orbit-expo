/*
*
* NOTES ON THE STRUCTURE OF THIS APP
*
* I plan to use Redux for all firebase firestore updates, transactions, etc.
* For most functionality I will implement cloud https functions except when it is
* an easy write to the database with minimal logic. In this case I will write directly.
*
* I plan on implementing global state with the current user logged in in order to
* prevent having to call an asynchronous function each time I wish to retrieve the user.
* The same goes for getting data from the game object.
*
* */

/*
* ORBIT SCRUM
*
* -- Alert the user if he makes the leader board (do this by changing leaderboard to modal?)
* -- Fix glitch when going from market to itinerary and opening the bank modal and going back to market,
*    the graph is higher than it should be
*
* MISC NOTES
* -- It may be a good thing that we make updates so that those at the top of the leaderboard
* go challenged when a new leaderboard pops up?
*
* */

window.Image = () => {};
console.disableYellowBox = true;

import React from 'react';
// Image.prefetch('./assets/icons/AsteroidClunker.png');
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import ReduxThunk from 'redux-thunk';
import reducers from './src/reducers';
import Expo, {Constants, Font} from 'expo';
import firebase from 'firebase';

import * as Types from './src/actions/types';

import {StackNavigator, NavigationActions} from 'react-navigation';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import ChooseScreen from './src/screens/ChooseScreen';
import SinglePlayerScreen from './src/screens/SinglePlayerScreen';
import SinglePlayerGameScreen from './src/screens/SinglePlayerGameScreen';
import PhoneVerify from './src/screens/PhoneVerifyScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';

import keys from './keys.json';

const Navigator = StackNavigator({
  Welcome: {
    screen: WelcomeScreen,
    navigationOptions: {
      header: null
    }
  },
  Auth: {
    screen: AuthScreen,
    navigationOptions: {
      header: null
    }
  },
  PhoneVerify: {
    screen: PhoneVerify,
    navigationOptions: {
      header: null
    }
  },
  Choose: {
    screen: ChooseScreen,
  },
  SinglePlayer: {
    screen: SinglePlayerScreen
  },
  SinglePlayerGame: {
    screen: SinglePlayerGameScreen
  },
  Leaderboard: {
    screen: LeaderboardScreen
  }
}, {
  navigationOptions: {
    headerStyle: {
      paddingTop: Constants.statusBarHeight + (64-Constants.statusBarHeight - 20)/2,
      height: 64
    }
  }
});

export default class extends React.Component{

  state = {
    loading: true
  };

  componentWillMount(){
    process.env.URL = keys.url.global;
    // process.env.URL = keys.url.local;
    // process.env.URL = keys.url.network;

    firebase.initializeApp(keys.config);

    firebase.auth().onAuthStateChanged(user => {
      if(this.state.loading) this.setState({loading: false});
      if(user){
        console.log(user);
        this._navigator.dispatch(NavigationActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({routeName: 'Choose'})]
        }));
        this.store.dispatch({type: Types.SET_NAVIGATOR, payload: this._navigator});
        return;
      }
      this.store.dispatch({
        type: Types.UPDATE_USER,
        payload: user
      });
      this._navigator.dispatch(NavigationActions.reset({
        index: 0,
        actions: [NavigationActions.navigate({routeName: 'Welcome'})]
      }));
    });
  }

  componentDidMount() {
    // Font.loadAsync({
    //   'monospace': require('./assets/fonts/Monospace.ttf')
    // });
  }

  store = createStore(reducers, {}, applyMiddleware(ReduxThunk));
  render(){

    if(this.state.loading){
      return <Expo.AppLoading/>
    }

    return(
      <Provider store={this.store}>
        <Navigator
          ref={ref => this._navigator = ref}
        />
      </Provider>
    )
  }
}