'use strict';

function Version(str, tags, isRelease) {
    if (typeof tags === 'boolean') {
        isRelease = tags;
        tags = null;
    }
    
    var matched = str && str.match(/^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*))?(?:\+([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*))?$/);

    if (!matched) { throw new Error('Failed to match version'); }
    
    this.major = +matched[1];
    this.minor = +matched[2];
    this.patch = +matched[3];
    this.meta = matched[5];
    
    var split = ( matched[4] && matched[4].split('.') ) || [ ];
    
    var bidx = null, build = null;
    
    for (var i = 0, b; i < split.length; i++) {
        b = parseInt(split[i], 10);
        if (isNaN(b)) { continue; }
        bidx = i;
        build = b;
        break;
    }
    
    if (tags) {
        if (typeof tags === 'string') {
            tags = tags.split(/[. ]/);
        }
        split = tags;
        bidx = null;
    }

    split = split.map(function (tag) {
        return tag.replace(/[^a-zA-Z0-9-]/g, '');
    });
    
    this.tags = split;
    this.build = build;
    this.bidx = bidx;

    this.isRelease = isRelease || false;
}
Version.prototype.bump = function (type) {
    switch (type) {
        case 'major':
            this.major++;
            this.minor = this.patch = this.build = 0;
        break;
        case 'minor':
            this.minor++;
            this.patch = this.build = 0;
        break;
        case 'patch':
            this.patch++;
            this.build = 0;
        break;
        default:
            this.build++;
        break;
    }
};
Version.prototype.toString = function (release) {
    var str = this.major + '.' + this.minor + '.' + this.patch,
        tags = this.tags.slice(0);
    
    // if this is a release, drop all metadata
    if (this.isRelease) {
        return str;
    }
    
    // if this is not a release, but there was a build number, replace it with the new one, if any
    if (this.bidx !== null) {
        tags[this.bidx] = this.build;
    }
    // if this is not a release, the build number wasn't present, but it has been bumped, add it
    else if (this.bidx === null && this.build > 0) {
        tags.unshift(this.build);
    }

    var tagStr = tags.join('.');
    if (tagStr) {
        str += '-' + tagStr;
    }
    
    if (this.meta) {
        str += '+' + this.meta;
    }

    return str;
};

module.exports = Version;
