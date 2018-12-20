import fs from 'fs';
import sourcemaps from 'rollup-plugin-sourcemaps';
import {plugins} from './build/rollup_plugins';

const version = JSON.parse(fs.readFileSync('package.json')).version;
const {BUILD, MINIFY} = process.env;
const minified = MINIFY === 'true';
const production = BUILD === 'production';
const outputFile =
    !production ? 'dist/mapbox-gl-arcgis-tiled-map-service-dev.js' :
    minified ? 'dist/mapbox-gl-arcgis-tiled-map-service.js' : 'dist/mapbox-gl-arcgis-tiled-map-service-unminified.js';

const config = [{
    input: 'src/index.js',
    output: {
        name: 'ArcGISTiledMapServiceSource',
        file: outputFile,
        format: 'umd',
        sourcemap: production ? true : 'inline',
        indent: false        
    },
    experimentalCodeSplitting: true,
    treeshake: production,
    plugins: plugins()
}
];

export default config