import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Header from './header';
import Footer from './footer';

class App extends Component {
  render() {
    return (
      <View>
        <Header/>
        <View>App!</View>
        <Footer/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  
});

export default App;