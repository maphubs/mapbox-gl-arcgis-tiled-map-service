// @flow

import { extend, pick } from 'mapbox-gl/src/util/util';
import { getImage, ResourceType } from 'mapbox-gl/src/util/ajax';
import { Event, ErrorEvent, Evented } from 'mapbox-gl/src/util/evented';
import loadArcGISMapServer from './load_arcgis_mapserver';
import TileBounds from 'mapbox-gl/src/source/tile_bounds';
import {_template, _getSubdomain} from './helpers';
import Texture from 'mapbox-gl/src/render/texture';

import type {Source} from 'mapbox-gl/src/source/source';
import type {OverscaledTileID} from 'mapbox-gl/src/source/tile_id';
import type Map from 'mapbox-gl/src/ui/map';
import type Dispatcher from 'mapbox-gl/src/util/dispatcher';
import type Tile from 'mapbox-gl/src/source/tile';
import type {Callback} from 'mapbox-gl/src/types/callback';

class ArcGISTiledMapServiceSource extends Evented implements Source {

    type: 'raster' | 'raster-dem';
    id: string;
    minzoom: number;
    maxzoom: number;
    url: string;
    scheme: string;
    tileSize: number;

    bounds: ?[number, number, number, number];
    tileBounds: TileBounds;
    roundZoom: boolean;
    dispatcher: Dispatcher;
    map: Map;
    tiles: Array<string>;

    _loaded: boolean;
    _options: RasterSourceSpecification | RasterDEMSourceSpecification;

    constructor(id: string, options: RasterSourceSpecification | RasterDEMSourceSpecification, dispatcher: Dispatcher, eventedParent: Evented) {
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

        this._options = extend({}, options);
        extend(this, pick(options, ['url', 'scheme', 'tileSize']));
    }

    load() {
        this.fire(new Event('dataloading', {dataType: 'source'}));
        loadArcGISMapServer(this._options, (err, metadata) => {
            if (err) {
                this.fire(new ErrorEvent(err));
            } else if (metadata) {
                extend(this, metadata);

                if (metadata.bounds) {
                    this.tileBounds = new TileBounds(metadata.bounds, this.minzoom, this.maxzoom);
                }

            // `content` is included here to prevent a race condition where `Style#_updateSources` is called
            // before the TileJSON arrives. this makes sure the tiles needed are loaded once TileJSON arrives
            // ref: https://github.com/mapbox/mapbox-gl-js/pull/4347#discussion_r104418088
            this.fire(new Event('data', {dataType: 'source', sourceDataType: 'metadata'}));
            this.fire(new Event('data', {dataType: 'source', sourceDataType: 'content'}));
            }
        });
    }

    onAdd(map: Map) {
        // set the urls
        const baseUrl = this.url.split('?')[0];
        this.tileUrl = `${baseUrl}/tile/{z}/{y}/{x}`;

        const arcgisonline = new RegExp(/tiles.arcgis(online)?\.com/g);
        if (arcgisonline.test(this.url)) {
            this.tileUrl = this.tileUrl.replace('://tiles', '://tiles{s}');
            this.subdomains = ['1', '2', '3', '4'];
        }

        if (this.token) {
            this.tileUrl += (`?token=${this.token}`);
        }
        
        this.map = map;
        this.load();
    }

    serialize() {
        return extend({}, this._options);
    }

    hasTile(tileID: OverscaledTileID) {
        return !this.tileBounds || this.tileBounds.contains(tileID.canonical);
    }

    loadTile(tile: Tile, callback: Callback<void>) {
        //convert to ags coords
        const tilePoint = { z: tile.tileID.overscaledZ, x: tile.tileID.canonical.x, y: tile.tileID.canonical.y };

        const url =  _template(this.tileUrl, extend({
            s: _getSubdomain(tilePoint, this.subdomains),
            z: (this._lodMap && this._lodMap[tilePoint.z]) ? this._lodMap[tilePoint.z] : tilePoint.z, // try lod map first, then just defualt to zoom level
            x: tilePoint.x,
            y: tilePoint.y
        }, this.options));
        tile.request = getImage({url},  (err, img) => {
            delete tile.request;

            if (tile.aborted) {
                tile.state = 'unloaded';
                callback(null);
            } else if (err) {
                tile.state = 'errored';
                callback(err);
            } else if (img) {
                if (this.map._refreshExpiredTiles) tile.setExpiryData(img);
                delete (img: any).cacheControl;
                delete (img: any).expires;

                const context = this.map.painter.context;
                const gl = context.gl;
                tile.texture = this.map.painter.getTileTexture(img.width);
                if (tile.texture) {
                    tile.texture.update(img, { useMipmap: true });
                } else {
                    tile.texture = new Texture(context, img, gl.RGBA, { useMipmap: true });
                    tile.texture.bind(gl.LINEAR, gl.CLAMP_TO_EDGE, gl.LINEAR_MIPMAP_NEAREST);

                    if (context.extTextureFilterAnisotropic) {
                        gl.texParameterf(gl.TEXTURE_2D, context.extTextureFilterAnisotropic.TEXTURE_MAX_ANISOTROPY_EXT, context.extTextureFilterAnisotropicMax);
                    }
                }

                tile.state = 'loaded';

                callback(null);
            }
        });
    }

    abortTile(tile: Tile, callback: Callback<void>) {
        if (tile.request) {
            tile.request.cancel();
            delete tile.request;
        }
        callback();
    }

    unloadTile(tile: Tile, callback: Callback<void>) {
        if (tile.texture) this.map.painter.saveTileTexture(tile.texture);
        callback();
    }

    hasTransition() {
        return false;
    }
}

export default ArcGISTiledMapServiceSource;