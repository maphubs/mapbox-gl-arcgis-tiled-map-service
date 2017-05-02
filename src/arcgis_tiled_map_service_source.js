'use strict';

const util = require('mapbox-gl/src/util/util');
const ajax = require('mapbox-gl/src/util/ajax');
const Evented = require('mapbox-gl/src/util/evented');
const loadArcGISMapServer = require('./load_arcgis_mapserver');
const TileBounds = require('mapbox-gl/src/source/tile_bounds');

//From https://github.com/Leaflet/Leaflet/blob/master/src/core/Util.js
const _templateRe = /\{ *([\w_]+) *\}/g;
const _template = function (str, data) {
    return str.replace(_templateRe, (str, key) => {
        let value = data[key];

        if (value === undefined) {
            throw new Error(`No value provided for variable ${str}`);

        } else if (typeof value === 'function') {
            value = value(data);
        }
        return value;
    });
};

//From https://github.com/Leaflet/Leaflet/blob/master/src/layer/tile/TileLayer.js
const _getSubdomain = function (tilePoint, subdomains) {
    if (subdomains) {
        const index = Math.abs(tilePoint.x + tilePoint.y) % subdomains.length;
        return subdomains[index];
    }
    return null;
};

class ArcGISTiledMapServiceSource extends Evented {

    constructor(id, options, dispatcher, eventedParent) {
        super();
        this.id = id;
        this.dispatcher = dispatcher;
        this.setEventedParent(eventedParent);

        this.type = 'arcgisraster';
        this.minzoom = 0;
        this.maxzoom = 22;
        this.roundZoom = true;
        this.tileSize = 512;
        this._loaded = false;
        this.options = options;
        util.extend(this, util.pick(options, ['url', 'scheme', 'tileSize']));
    }

    load() {
        this.fire('dataloading', {dataType: 'source'});
        loadArcGISMapServer(this.options, (err, metadata) => {
            if (err) {
                return this.fire('error', err);
            }
            util.extend(this, metadata);
            this.setBounds(metadata.bounds);

            // `content` is included here to prevent a race condition where `Style#_updateSources` is called
            // before the TileJSON arrives. this makes sure the tiles needed are loaded once TileJSON arrives
            // ref: https://github.com/mapbox/mapbox-gl-js/pull/4347#discussion_r104418088
            this.fire('data', {dataType: 'source', sourceDataType: 'metadata'});
            this.fire('data', {dataType: 'source', sourceDataType: 'content'});

        });
    }

    onAdd(map) {
        // set the urls
        const baseUrl = this.url.split('?')[0];
        this.tileUrl = `${baseUrl} /tile/{z}/{y}/{x}`;

        const arcgisonline = new RegExp(/tiles.arcgis(online)?\.com/g);
        if (arcgisonline.test(this.url)) {
            this.tileUrl = this.tileUrl.replace('://tiles', '://tiles{s}');
            this.subdomains = ['1', '2', '3', '4'];
        }

        if (this.token) {
            this.tileUrl += (`?token=${this.token}`);
        }
        this.load();
        this.map = map;
    }

    setBounds(bounds) {
        this.bounds = bounds;
        if (bounds) {
            this.tileBounds = new TileBounds(bounds, this.minzoom, this.maxzoom);
        }
    }

    serialize() {
        return {
            type: 'arcgisraster',
            url: this.url,
            tileSize: this.tileSize,
            tiles: this.tiles,
            bounds: this.bounds,
        };
    }

    hasTile(coord) {
        return !this.tileBounds || this.tileBounds.contains(coord, this.maxzoom);
    }

    loadTile(tile, callback) {
        //convert to ags coords
        const tilePoint = tile.coord;
        const url =  _template(this.tileUrl, util.extend({
            s: _getSubdomain(tilePoint, this.subdomains),
            z: (this._lodMap && this._lodMap[tilePoint.z]) ? this._lodMap[tilePoint.z] : tilePoint.z, // try lod map first, then just defualt to zoom level
            x: tilePoint.x,
            y: tilePoint.y
        }, this.options));
        tile.request = ajax.getImage(url, done.bind(this));

        function done(err, img) {
            delete tile.request;

            if (tile.aborted) {
                this.state = 'unloaded';
                return callback(null);
            }

            if (err) {
                this.state = 'errored';
                return callback(err);
            }

            if (this.map._refreshExpiredTiles) tile.setExpiryData(img);
            delete img.cacheControl;
            delete img.expires;

            const gl = this.map.painter.gl;
            tile.texture = this.map.painter.getTileTexture(img.width);
            if (tile.texture) {
                gl.bindTexture(gl.TEXTURE_2D, tile.texture);
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
            } else {
                tile.texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tile.texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                if (this.map.painter.extTextureFilterAnisotropic) {
                    gl.texParameterf(gl.TEXTURE_2D, this.map.painter.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, this.map.painter.extTextureFilterAnisotropicMax);
                }

                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                tile.texture.size = img.width;
            }
            gl.generateMipmap(gl.TEXTURE_2D);

            tile.state = 'loaded';

            callback(null);
        }
    }

    abortTile(tile) {
        if (tile.request) {
            tile.request.abort();
            delete tile.request;
        }
    }

    unloadTile(tile) {
        if (tile.texture) this.map.painter.saveTileTexture(tile.texture);
    }
}

module.exports = ArcGISTiledMapServiceSource;
