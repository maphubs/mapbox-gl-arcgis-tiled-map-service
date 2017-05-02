# Mapbox GL Custom Source for ArcGIS Tiled Map Services

This is an unofficial plugin, and is not affliated with Mapbox or Esri. 😇

⚠️Custom sources are still under development and have not yet been publicly documented. This may break with future versions of mapbox-gl. It is currently being used with v0.36.0⚠️

## Installation

```sh
npm install mapbox-gl-arcgis-tiled-map-service
``` 
or 
```sh
yarn add mapbox-gl-arcgis-tiled-map-service
```

## Usage

```js
const ArcGISRasterTileSource = require('mapbox-gl-arcgis-tiled-map-service');
var map = new mapboxgl.Map({
  /* ... */
});
map.addSourceType('arcgisraster', ArcGISRasterTileSource, (err) => {
  if(err){
    /*do something*/
  }
});

map.addSource('amazon-human-footprint', {
    "type": "arcgisraster',
    "url": "https://tiles.arcgis.com/tiles/RTK5Unh1Z71JKIiR/arcgis/rest/services/HumanFootprint/MapServer?f=json",
    "tileSize": 256
});

map.addLayer({
  "id": "amazon-human-footprint",
  "type": "raster",
  "source": "amazon-human-footprint",
  "minzoom": 0,
  "maxzoom": 18,
  "paint": {
    "raster-opacity": 75
  });

```




## Development

Build: `npm run build-dev`


## License

MIT

## Attributions

Some code was adapted from https://github.com/Leaflet/Leaflet and  https://github.com/Esri/esri-leaflet


