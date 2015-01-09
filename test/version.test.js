'use strict';

var Version = require('../lib/version');

require('should');

function helper(type, obj) {
    Object.keys(obj).forEach(function (key) {
        var ver = new Version(key);
        ver.bump(type);
        try {
            ver.toString().should.equal(obj[key]);
        } catch (e) {
            console.log(ver);
            throw e;
        }
    });
}

describe('Version', function () {
    it('should output its input', function () {
        ['1.2.3', '1.2.3-foo', '1.2.3-foo.0', '1.2.3+bar', '1.2.3+bar.0', '1.2.3-foo+bar', '12.34.56-78']
        .forEach(function (a) {
            var ver = new Version(a);
            ver.toString().should.equal(a);
        });
    });
    it('should throw on invalid semver strings', function () {
        ['foo', '1.2', '1.2.3.4', '1.2.3+foo+bar', null]
        .forEach(function (a) {
            (function () {
                new Version(a);
            }).should.throw(/Failed to match version/);
        }); 
    });
    it('should bump the build number', function () {
        helper('build', {
            '1.2.3': '1.2.3-1', // adds build if not present
            '1.2.3-foo': '1.2.3-1.foo', // prepends build if not present
            '1.2.3-foo.0': '1.2.3-foo.1', // maintains position if present
            '1.2.3+bar': '1.2.3-1+bar', // maintains metadata
            '1.2.3+bar.0': '1.2.3-1+bar.0', // doesn't confuse metadata for pre-release data
            '1.2.3-0': '1.2.3-1', // zero
            '1.2.3-1': '1.2.3-2',
            '12.34.56-78': '12.34.56-79', //double digits
            '1.2.3-9': '1.2.3-10' // 9 -> 10
        });
    });
    it('should bump the patch number', function () {
        helper('patch', {
            '1.2.0': '1.2.1', // zero
            '1.2.3': '1.2.4',
            '1.2.3-foo': '1.2.4-foo',
            '1.2.3-foo.3': '1.2.4-foo.0', // resets build number if identified
            '1.2.3-foo.3.5': '1.2.4-foo.0.5', // only takes the first numerical value
            '1.2.3+bar': '1.2.4+bar',
            '12.34.56-78': '12.34.57-0', // double digits
            '1.2.9': '1.2.10' // 9 -> 10
        });
    });
    it('should bump the minor version number', function () {
        helper('minor', {
            '1.0.0': '1.1.0', // zero
            '1.2.3': '1.3.0',
            '1.2.3-foo': '1.3.0-foo',
            '1.2.3-foo.3': '1.3.0-foo.0', // resets build number if identified
            '1.2.3-foo.3.5': '1.3.0-foo.0.5', // only takes the first numerical value
            '1.2.3+bar': '1.3.0+bar',
            '12.34.56-78': '12.35.0-0', //double digits
            '1.9.0': '1.10.0' // 9 -> 10
        });        
    });
    it('should bump the major version number', function () {
        helper('major', {
            '0.0.0': '1.0.0', // zero
            '1.2.3': '2.0.0',
            '1.2.3-foo': '2.0.0-foo',
            '1.2.3-foo.3': '2.0.0-foo.0', // resets build number if identified
            '1.2.3-foo.3.5': '2.0.0-foo.0.5', // only takes the first numerical value
            '1.2.3+bar': '2.0.0+bar',
            '12.34.56-78': '13.0.0-0', //double digits
            '9.0.0': '10.0.0' // 9 -> 10
        });        
    });
});

describe('tags', function () {
    it('should add prerelease tags', function () {
        var ver = new Version('1.2.3', ['foo', 'bar']);
        ver.toString().should.equal('1.2.3-foo.bar');
    });
    it('should not duplicate prerelease tags', function () {
        var ver = new Version('1.2.3-foo', ['foo', 'bar']);
        ver.toString().should.equal('1.2.3-foo.bar');
    });
});

describe('releases', function () {
    it('should drop any metadata if present', function () {
        ['1.2.3-0', '1.2.3-1', '1.2.3-foo', '1.2.3-foo+bar', '1.2.3-foo.0+bar', '1.2.3+bar']
        .forEach(function (a) {
            var ver = new Version(a, true);
            ver.toString().should.equal('1.2.3');
        });
    });
});