'use strict';

var PATH = require('path'),
    gift = require('gift'),
    fs = require('fs');

var Promise = require('bluebird');

var Version = require('./version');

Promise.promisifyAll(fs);

function CLI(_argv, baseDir) {
    this.packageLoc = CLI.getPackageJson(baseDir);
    this.projectDir = PATH.dirname(this.packageLoc);
    this.json = require(this.packageLoc);
    var parsed = CLI.parseArgs(_argv);
    this.argv = parsed.argv;
    this.help = parsed.help;
}

CLI.prototype.bump = Promise.method(function () {
    var argv = this.argv,
        VERBOSE = argv.verbose;
    
    var version = new Version(this.json.version, argv._, argv.release);
    
    if (VERBOSE) { console.log("Current version: %s (%s)", version, this.json.version); }
    
    version.bump(argv.major ? 'major' : argv.minor ? 'minor' : argv.patch ? 'patch' : 'build');
    
    if (VERBOSE) { console.log("New version: %s", version); }
    
    var repo, version = version.toString();
    
    return Promise.bind(this)
    .then(function () {
        if (argv.commit) {
            if (VERBOSE) { console.log("Writing %s", this.packageLoc); }
        
            this.json.version = version.toString();
            return fs.writeFile$(this.packageLoc, JSON.stringify(this.json, null, '  '));
        } else {
            if (VERBOSE) { console.log("Would write %s", this.packageLoc); }
        }
    })
    .then(function () {
        repo = gift(this.projectDir);
        Promise.promisifyAll(repo, { suffix: '$' });
        
        return repo.status$()
    })
    .catch(function (err) {
        repo = err;
        
        if (VERBOSE) {
            console.log("Not a valid repository: %s", this.packageLoc);
        }
        throw err;
    })
    .then(function () {
        if (argv.commit) {
            if (VERBOSE) { console.log("Committing change"); }
            
            return Promise.try(function () {
                return repo.add$('package.json');
            })
            .then(function () {
                return repo.commit$('Version bump');
            });
        } else {
            if (VERBOSE) { console.log("Would commit change"); }
        }
    })
    .then(function () {
        if (!argv.tag) { return; }
        
        return repo.tags$()
        .map(function (tag) {
            return tag.name
        })
        .then(function (tags) {
            if (tags.indexOf(version.toString()) > -1) {
                console.error("Tag already exists: %s", version);
                return;
            }
            
            if (argv.commit) {
                if (VERBOSE) { console.log("Creating tag: %s", version); }
                
                return repo.create_tag$(version);
            } else {
                if (VERBOSE) { console.log("Would create tag: %s", version); }
            }
        });
    })
    .catch(function (err) {
        // it's okay to use this without having a git repo
        if (err === repo) { return; }
        throw err;
    })
    .then(function () {
        if (!VERBOSE) { console.log(version.toString()); }
    });
});

var absRE = /^\/|[A-Za-z]:[\\\/]/;
CLI.getPackageJson = function (dir) {
    var stat = null;
    
    var pj = PATH.join(dir || process.cwd(), 'package.json');
    
    try {
        var stat = fs.statSync(pj);
    } catch (e) { }
    
    if (pj === null && !absRE.test(pj)) {
        pj = PATH.join(process.cwd(), pj);
        
        try {
            var stat = fs.statSync(pj);
        } catch (e) { }
    }
    
    if (!stat) {
        throw new Error('Couldn\'t find package.json');
    }
    
    if (!stat.isFile()) {
        throw new Error('Not a file: ' + pj);
    }
    
    return pj;
};
CLI.parseArgs = function (_argv) {
    return require('optimist')
        .boolean('verbose')
        .boolean('major')
        .boolean('minor')
        .boolean('patch')
        .boolean('build')
        .boolean('release')
        .boolean('commit')
        .boolean('tag')
        .boolean('push')
        .alias('v', 'verbose')
        .alias('m', 'major')
        .alias('j', 'major')
        .alias('n', 'minor')
        .alias('p', 'patch')
        .alias('b', 'build')
        .alias('r', 'release')
        .alias('c', 'commit')
        .alias('t', 'tag')
        .alias('f', 'file')
        .alias('u', 'push')
        .describe('v', 'Show what\'s going on in detail')
        .describe('m', 'Bump the major version number')
        .describe('n', 'Bump the minor version number')
        .describe('p', 'Bump the patch version number')
        .describe('b', 'Bump the build pre-release version')
        .describe('r', 'Drop pre-release and build metadata tags')
        .describe('c', 'Apply changes to package.json (and commit changes to git, if available')
        .describe('t', 'Create a git tag for this version')
        .describe('u', 'Push changes upstream (and tags, if created)');
};

module.exports = CLI;