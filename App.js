import React from 'react';
import {Provider} from 'react-redux';
import {createStore, applyMiddleware} from 'redux';
import ReduxThunk from 'redux-thunk';
import reducers from './src/reducers';
import Expo, {Constants} from 'expo';
import firebase from 'firebase';

import * as Types from './src/actions/types';

import {StackNavigator, NavigationActions} from 'react-navigation';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import ChooseScreen from './src/screens/ChooseScreen';
import SinglePlayerScreen from './src/screens/SinglePlayerScreen';
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
	Choose: {
		screen: ChooseScreen,
	},
	SinglePlayer: {
		screen: SinglePlayerScreen
	}
});

export default class extends React.Component{

	state = {
		loading: true
	}

	async componentWillMount(){
		await firebase.initializeApp({
			apiKey: 'AIzaSyAoh8fDZ9x5b5NI39xFHe--DnqGOsxrxlc',
			authDomain: 'smuggler-23fe7.firebaseapp.com',
			projectId: 'smuggler-23fe7'
		});
		firebase.auth().onAuthStateChanged(user => {
			if(this.state.loading) this.setState({loading: false});
			console.log(user);
			if(user){
				this._navigator.dispatch(NavigationActions.reset({
					index: 0,
					actions: [NavigationActions.navigate({routeName: 'Choose'})]
				}))
			}
			this.store.dispatch({
				type: Types.UPDATE_USER,
				payload: user
			});
		});
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