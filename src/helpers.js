
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

module.exports = {
    _template,
    _getSubdomain
};
