import React from 'react';
import{
  View,
  Text
} from 'react-native';
import {connect} from 'react-redux';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import {
  fetchLeaderboard30,
  fetchLeaderboard60,
  fetchLeaderboard90,
  unmountFetchLeaderboard30,
  unmountFetchLeaderboard60,
  unmountFetchLeaderboard90,
  resetPage
} from '../actions/LeaderboardActions';
import Loading from '../components/misc/Loading';

class LeaderboardScreen extends React.Component{

  static navigationOptions = {
    title: 'Leaderboards'
  };

  // you should combine these three methods
  componentWillMount(){
    this.props.fetchLeaderboard30();
    this.props.fetchLeaderboard60();
    this.props.fetchLeaderboard90();
  }

  componentWillUnmount(){
    // this.props.unmountFetchLeaderboard30();
    // this.props.unmountFetchLeaderboard60();
    // this.props.unmountFetchLeaderboard90();
    this.props.resetPage();
  }

  render(){
    return(
      <ScrollableTabView page={this.props.page}>
        <LeaderboardList topDawgs={this.props.leaders30} tabLabel={'30 weeks'}/>
        <LeaderboardList topDawgs={this.props.leaders60} tabLabel={'60 weeks'}/>
        <LeaderboardList topDawgs={this.props.leaders90} tabLabel={'90 weeks'}/>
      </ScrollableTabView>
    );
  }
}

export default connect(state => {
  return{
    leaders30: state.leaderboardReducer.leaderboard30,
    leaders60: state.leaderboardReducer.leaderboard60,
    leaders90: state.leaderboardReducer.leaderboard90,
    page: state.leaderboardReducer.page
  }
}, {
  fetchLeaderboard30,
  fetchLeaderboard60,
  fetchLeaderboard90,
  unmountFetchLeaderboard30,
  unmountFetchLeaderboard60,
  unmountFetchLeaderboard90,
  resetPage
})(LeaderboardScreen);

class LeaderboardList extends React.Component{

  // don't let users view more than ten because it will satisfy them!
  // they must not settle for anything less than best!
  renderLeaders(){
    return this.props.topDawgs.map((user, i) => {
      return(
        <View style={{margin: 10, flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 20}}>{i+1}.  </Text>
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>{user.name}</Text>
          </View>
          <Text style={{fontSize: 20}}>∂ {user.score}</Text>
        </View>
      );
    });
  }

  render(){
    console.log(this.props.topDawgs, 'the top dawgs');
    if(!this.props.topDawgs){
      console.log('returned loading');
      return <Loading/>
    }

    return(
      <View style={{flex: 1}}>
        {this.renderLeaders()}
      </View>
    );
  }
}