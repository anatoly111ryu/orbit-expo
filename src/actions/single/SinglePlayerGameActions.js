import * as Types from '../types';
import axios from 'axios';
import firebase from 'firebase';

export const nextPeriod = (gameId, last, location, cb) => {
	return async dispatch => {
		dispatch({type: Types.NEXT_PERIOD});
		dispatch({type: Types.TOGGLE_ABSOLUTE_LOADING});
		let token = await firebase.auth().currentUser.getIdToken();
		axios.post(process.env.URL + '/nextPeriod', {
			gameId,
			location
		}, {
			headers: {
				'x-auth': token
			}
		}).then(() => {
			dispatch({type: Types.NEXT_PERIOD_SUCCESS});
			dispatch({type: Types.CLOSE_TRAVEL_MODAL});
			dispatch({type: Types.TOGGLE_ABSOLUTE_LOADING});
			if(last){
				// dispatch a navigator action that goes back to the SinglePlayerScreen
				cb();
			}
		}).catch(e => {
			if(e){
				cb();
				console.log('called callback');
				dispatch({type: Types.NEXT_PERIOD_FAIL, error: e.response.data.error});
			}
			// changing to .message might be fix because alert() doesn't work for objects

			// dispatch({type: Types.TOGGLE_ABSOLUTE_LOADING});
		});
	}
};

export const borrow = (gameId, amount) => {
	return async dispatch => {
		const db = firebase.firestore();
		const ref = db.collection('single').doc(gameId);
		db.runTransaction(t => {
			return t.get(ref).then(doc => {
				let game = doc.data();
				let chips = game.chips + amount;
				let debt = game.debt + amount;
				t.update(ref, {chips, debt});
			});
		}).then(() => {
			dispatch({type: Types.CLOSE_BANK_MODAL});
			dispatch({type: Types.SET_BANK_MODAL_AMOUNT, payload: 0});
		}).catch((e) => {
			alert('Transaction failed');
			console.log(e);
		});
	}
};

export const payBack = (gameId, amount) => {
	return async dispatch => {
		const db = firebase.firestore();
		const ref = db.collection('single').doc(gameId);
		db.runTransaction(t => {
			return t.get(ref).then(doc => {
				let game = doc.data();
				let chips = game.chips - amount;
				let debt = game.debt - amount;
				t.update(ref, {chips, debt});
			});
		}).then(() => {
			dispatch({type: Types.CLOSE_BANK_MODAL});
			dispatch({type: Types.SET_BANK_MODAL_AMOUNT, payload: 0});
		}).catch((e) => {
			alert('Transaction failed');
			console.log(e);
		});
	}
};

const costObj = {
	'Asteroid Clunker': '0',
	'Trade Vessel': '200,000',
	'Curator Starfighter': '1,000,000',
	'Imperial Yacht': '10,000,000'
};
const rawCost = {
	'Asteroid Clunker': 0,
	'Trade Vessel': 200000,
	'Curator Starfighter': 1000000,
	'Imperial Yacht': 10000000
};
import gameData from '../../gameData.json';
export const buyShip = (gameId, ship) => {
	return async dispatch => {
		dispatch({type: Types.SHIP_PURCHASE});
		const db = firebase.firestore();
		const ref = db.collection('single').doc(gameId);
		db.runTransaction(t => {
			return t.get(ref).then(doc => {
				let game = doc.data();
				let chips = game.chips;
				let cost = rawCost[ship];
				if(chips < cost){
					return Promise.reject('Insufficient funds');
				}
				let index;
				gameData.ships.map((shipObj, i) => {
					if(shipObj.name === ship){
						index = i;
					}
				});
				if(isNaN(index)){
					return Promise.reject('Invalid ship choice');
				}
				let shipObj = gameData.ships[index];

				let spaceOccupied = 0;
				for(let item in gameData.repository){
					spaceOccupied += gameData.repository[item].qty;
				}
				let space = shipObj.maxSpace - spaceOccupied;

				t.update(ref, {
					chips: chips - cost,
					ship: {
						defense: shipObj.defense,
						maxSpace: shipObj.maxSpace,
						cost: shipObj.cost,
						name: ship,
						space: space
					}
				});
			});
		}).then(() => {
			dispatch({type: Types.SHIP_PURCHASED});
			dispatch({type: Types.CLOSE_SHIP_MODAL});
		}).catch(e => {
			dispatch({type: Types.SHIP_PURCHASE_FAILED, payload: e});
		});
	}
};

export const buyContraband = (gameId, amountBuy, contrabandType, cb) => {
	return async dispatch => {
		dispatch({type: Types.BUY_CONTRABAND});
		const db = firebase.firestore();
		const ref = db.collection('single').doc(gameId);
		db.runTransaction(t => {
			return t.get(ref).then(doc => {
				let game = doc.data();
				let price = game.repository[contrabandType].prices.slice(-1).pop();
				let cost = amountBuy * price;
				let chips = game.chips;
				let newChips = chips - cost;
				if(amountBuy > game.ship.space){
					return Promise.reject('Not enough room on your ship!');
				}
				if(cost > chips){
					return Promise.reject('Insufficient funds!');
				}
				let newRepo = game.repository;
				newRepo[contrabandType].qty = amountBuy+game.repository[contrabandType].qty;
				t.update(ref, {
					chips: newChips,
					repository: newRepo,
					'ship.space': game.ship.space - amountBuy
				});
				return Promise.resolve();
			});
		}).then(() => {
			dispatch({type: Types.BOUGHT_CONTRABAND});
			cb();
		}).catch(e => {
			dispatch({type: Types.BUY_CONTRABAND_FAILED, payload: e});
		});
	}
};

export const sellContraband = (gameId, amountSell, contrabandType, cb) => {
	return async dispatch => {
		dispatch({type: Types.SELL_CONTRABAND});
		const db = firebase.firestore();
		const ref = db.collection('single').doc(gameId);
		db.runTransaction(t => {
			return t.get(ref).then(doc => {
				let game = doc.data();
				let price = game.repository[contrabandType].prices.slice(-1).pop();
				let cost = amountSell * price;
				let chips = game.chips;
				let newChips = chips + cost;
				let newRepo = game.repository;
				newRepo[contrabandType].qty = game.repository[contrabandType].qty - amountSell;
				t.update(ref, {
					chips: newChips,
					repository: newRepo,
					'ship.space': game.ship.space + amountSell
				});
				return Promise.resolve();
			});
		}).then(() => {
			dispatch({type: Types.SOLD_CONTRABAND});
			cb();
		}).catch(e => {
			dispatch({type: Types.SELL_CONTRABAND_FAILED, payload: e});
		});
	}
};

export const repairShip = (gameId) => {
	return async dispatch => {
		dispatch({type: Types.REPAIR_SHIP});
		const db = firebase.firestore();
		const ref = db.collection('single').doc(gameId);
		db.runTransaction(t => {
			return t.get(ref).then(doc => {
				let game = doc.data();
				let currentHealth = game.ship.health;
				let currentDamage = game.ship.damage;
				if(game.ship.damage === 0){
					return Promise.reject('Your ship is already at full health!');
				}
				if(game.chips < 15000){
					return Promise.reject('Insufficient funds');
				}
				t.update(ref, {
					chips: game.chips - 15000,
					'ship.damage': Math.max(0, game.ship.damage - 15)
				});
			});
		}).then(() => {
			dispatch({type: Types.REPAIRED_SHIP});
		}).catch((e) => {
			alert(e);
			dispatch({type: Types.REPAIRED_SHIP});
		});
	}
};