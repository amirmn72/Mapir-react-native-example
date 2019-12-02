/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import  React, {Component} from 'react';
import {Platform, StyleSheet, TextInput, View, Button, PermissionsAndroid} from 'react-native';
import axios from 'axios';
import polyline from 'google-polyline';
import Mapir from 'mapir-react-native-sdk';

type Props = {};
export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            route: {},
            routeLine: [],
            Markers: [],
            Map: [],
            location: [51.399863, 35.789938]
        };
        this.MapView = this.MapView.bind(this)
    }

    componentDidMount() {
        if(Platform === 'android')
        {
            PermissionsAndroid.requestMultiple(
                [PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION],
                {
                    title: 'Give Location Permission',
                    message: 'App needs location permission to find your position.'
                }
            ).then(granted => {
                console.log(granted);
                resolve();
            }).catch(err => {
                console.warn(err);
                reject(err);
            });
        }
    }

    search(text) {
        var _this = this;
        var dataMarker = [];
        axios({
            method: 'post',
            url: 'https://map.ir/search',
            headers: {
                "x-api-key": "Mapir.WsLdHK46I5Wfr5xgI0ynjjyiw9Fyhydu"
            },
            data: {
                "$top": 20,
                "text": text,
                "$select": "poi",
                "$filter": "province eq تهران",
                "location": {
                    "type": "Point",
                    "coordinates": [51.399863, 35.789938]
                }
            }
        }).then(function (data) {
            _this.setState({
                Markers: []
            });
            data.data.value.forEach(function (item, index) {
                dataMarker.push(
                    <Mapir.Marker key={index}
                                  id={'1'}
                                  title={item.Title}
                                  snippet={item.Title}
                                  coordinate={[item.Coordinate.lon, item.Coordinate.lat]}
                                  onSelected={() => _this.route(item.Coordinate.lat, item.Coordinate.lon)}>
                        <Mapir.Popup title={item.Title}/>
                    </Mapir.Marker>
                );
            });
            _this.setState({
                Markers: dataMarker
            })
        }).catch(function (error) {
            console.log('errorrrrr', error);
        })
    }

    route(lat, lon) {
        var _this = this;
        var dataRoute = [];
        _this.setState({
            route: [],
            routeLine: [],
            location: [lon, lat]
        });
        axios({
            method: 'get',
            url: `https://map.ir/routes/route/v1/driving/51.399863,35.789938;${lon},${lat}?alternatives=true&steps=true&overview=full`,
            headers: {
                "x-api-key": "Mapir.WsLdHK46I5Wfr5xgI0ynjjyiw9Fyhydu"
            },
        }).then(function (data) {
            var coordinates = [];
            polyline.decode(data.data.routes[0].geometry).forEach(function (item, index) {
                coordinates[index] = item.reverse()
            })
            _this.setState({
                route: {
                    "type": "FeatureCollection",
                    "features": [
                        {
                            "type": "Feature",
                            "properties": {},
                            "geometry": {
                                "type": "LineString",
                                "coordinates": coordinates
                            }
                        }
                    ]
                }
            });
            dataRoute.push(
                <Mapir.ShapeSource key={1} id='line1' shape={_this.state.route}>
                    <Mapir.LineLayer id='linelayer1' style={{lineColor: 'red'}}/>
                </Mapir.ShapeSource>
            )
            _this.setState({
                routeLine: dataRoute
            })
        }).catch(function (err) {
            console.log(err);
        })
    }

    MapView() {
        var _this = this
        var map = []
        _this.setState({
            Map: []
        })
        map.push(
            <Mapir
                key={1}
                accessToken={'Mapir.WsLdHK46I5Wfr5xgI0ynjjyiw9Fyhydu'}
                zoomLevel={13}
                centerCoordinate={[51.399863, 35.789938]}
                showUserLocation={true}
                style={styles.map} />
        )
        _this.setState({
            Map: map
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <TextInput placeholder='search'
                           onChangeText={(text) => this.search(text)}
                           style={styles.input}/>
                <Mapir
                    accessToken={'Mapir.WsLdHK46I5Wfr5xgI0ynjjyiw9Fyhydu'}
                    zoomLevel={13}
                    centerCoordinate={[51.399863, 35.789938]}
                    attributionEnabled={true}
                    style={styles.map}>
                    <Mapir.Marker id={'1'}
                                  title={'ما اینجا هستیم'}
                                  coordinate={[51.399863, 35.789938]}>
                        <Mapir.Popup title={'ما اینجا هستیم'}/>
                    </Mapir.Marker>
                    <Mapir.UserLocation animated={true}/>
                    <Mapir.Camera
                        zoomLevel={16}
                        animationMode={'flyTo'}
                        animationDuration={6000}
                        centerCoordinate={this.state.location}
                    />
                    {this.state.Markers}
                    {this.state.routeLine}
                </Mapir>
                {/*<Button title={"Map"} onPress={this.MapView} style={styles.button}/>*/}
                {/*<View>*/}
                    {/*{this.state.Map}*/}
                {/*</View>*/}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 2
    },
    map: {
        flex: 1,
        height: '50%',
        width: '100%'
    },
    input: {
        height: '10%'
    },
    button: {
        width: '100%',
        height: '10%',
        backgroundColor: 'red'
    }
});
