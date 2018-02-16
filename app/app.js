import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ListView,
  Keyboard,
  AsyncStorage,
  ActivityIndicator,
} from 'react-native';
import Header from './header';
import Footer from './footer';
import Row from './row';

const filterItems = (items, filter) => {
  return items.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'COMPLETED') return item.complete;
    if (filter === 'ACTIVE') return !item.complete;
  })
};

class App extends Component {
  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      loading: true,
      allComplete: false,
      filter: 'ALL',
      value: '',
      items: [],
      dataSource: ds.cloneWithRows([])
    };

    this.handleClearComplete = this.handleClearComplete.bind(this);
    this.handleFilter = this.handleFilter.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
    this.handleToggleComplete = this.handleToggleComplete.bind(this);
    this.setSource = this.setSource.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleToggleAllComplete = this.handleToggleAllComplete.bind(this);
  }

  componentWillMount() {
    AsyncStorage.getItem('items').then(json => {
      try {
        const items = JSON.parse(json);
        this.setSource(items, items, { loading: false });
      } catch (e) {
        this.setState({
          loading: false,
        })
      }
    })
  }

  setSource(items, itemsDatasource, otherState = {}) {
    this.setState({
      items,
      dataSource: this.state.dataSource.cloneWithRows(itemsDatasource),
      ...otherState
    });
    AsyncStorage.setItem('items', JSON.stringify(items));
  }

  handleFilter(filter) {
    this.setSource(this.state.items, filterItems(this.state.items, filter), { filter });
  }

  handleRemoveItem(key) {
    const newItems = this.state.items.filter(item => item.key !== key);
    this.setSource(newItems, filterItems(newItems, this.state.filter));
  }

  handleToggleComplete(key, complete) {
    const newItems = this.state.items.map((item) => {
      if (item.key !== key) return item;
      return {
        ...item,
        complete
      }
    });
    this.setSource(newItems, filterItems(newItems, this.state.filter));
  }

  handleToggleAllComplete() {
    const complete = !this.state.allComplete;
    const newItems = this.state.items.map((item) => ({
      ...item,
      complete
    }));
    this.setSource(newItems, filterItems(newItems, this.state.filter), { allComplete: complete })
  }

  handleAddItem() {
    if (!this.state.value) return;
    const newItems = [
      ...this.state.items,
      {
        key: Date.now(),
        text: this.state.value,
        complete: false
      }
    ];
    this.setSource(newItems, filterItems(newItems, this.state.filter), { value: '' })
  }

  handleClearComplete() {
    const newItems = filterItems(this.state.items, 'ACTIVE');
    this.setSource(newItems, filterItems(newItems, this.state.filter));
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          value={this.state.value}
          onAddItem={this.handleAddItem}
          onChange={(value) => this.setState({ value })}
          onToggleAllComplete={this.handleToggleAllComplete}
        />
        <View style={styles.content}>
          <ListView
            style={styles.list}
            enableEmptySections
            dataSource={this.state.dataSource}
            onScroll={() => Keyboard.dismiss()}
            renderRow={({ key, ...value}) => {
              return (
                <Row
                  key={key}
                  onRemove={() => this.handleRemoveItem(key)}
                  onComplete={(complete) => this.handleToggleComplete(key, complete)}
                  {...value}
                />
              )
            }}
            renderSeparator={(sectionId, rowId) => {
              return <View key={rowId} style={styles.separator}/>
            }}
          />
        </View>
        <Footer
          count={filterItems(this.state.items, 'ACTIVE').length}
          onFilter={this.handleFilter}
          filter={this.state.filter}
          onClearComplete={this.handleClearComplete}
        />
        {this.state.loading && <View style={styles.loading}>
          <ActivityIndicator
            animating
            size="large"
          />
        </View>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    ...Platform.select({
      ios: { paddingTop: 30 }
    })
  },
  loading: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, .2)'
  },
  content: {
    flex: 1
  },
  list: {
    backgroundColor: '#FFF',
  },
  separator: {
    borderWidth: 1,
    borderColor:'#F5F5F5',
  }
});

export default App;