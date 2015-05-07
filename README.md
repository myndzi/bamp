# Bamp

A version bump utility for node.js packages

# Global Installation

    npm install -g bamp

# Local installation/use

	npm install --save-dev bamp

package.json:

	"scripts": {
        "bamp": "bamp"
    }

Usage:

	npm run bamp -- -switches

# Usage

	bamp [switches] [prerelease tags]

For example, `bamp -bc development` might produce a version number of `1.0.3-1.development`

By default, `bamp` does not make any changes. It will print out the resulting version after processing for you to verify.

You must specify `--commit` to create changes; this will write the new version to package.json and, if possible, commit the change to git.  

`major`, `minor`, and `patch` specify which portion of the version string to bump. Semver semantics apply, so bumping the minor version from `1.2.3` will yield `1.3.0`

There is a slight addition here which doesn't seem to exist in other similar modules, which is the `build` version. The first integer, if present, in the prerelease version (in semver, this is the bolded portion of: major.minor.patch-**prerelease.tags**+build.metadata), will be taken as the build number; if you bump this value, it will be increased accordingly, and if you bump the patch version, it will be reset to zero. Furthermore, if you specify any prerelease tags, they will also be added to the version. Any existing prerelease tags are dropped in this process.

In other words, if you were to execute `bamp -b` on each of the following, you would get `1.0.0-1`:

- `1.0.0`
- `1.0.0-0`
- `1.0.0-foo`

And if you were to execute `bamp -b bar` on each of the following, you would get `1.0.0-1.bar`:

- `1.0.0`
- `1.0.0-0`
- `1.0.0-foo`  

Build metadata is preserved, however, so `bamp -b` with an input of `1.0.0-foo+bar` would produce `1.0.0-1+bar`.

# Command line arguments

	Options:
	  -v, --verbose    Show what's going on in detail
	  -m, --major      Bump the major version number
	  -n, --minor      Bump the minor version number
	  -p, --patch      Bump the patch version number
	  -b, --build      Bump the build pre-release version
	  -r, --release    Drop pre-release and build metadata tags
	  -c, --commit     Apply changes to package.json (and commit changes to git, if available
	  -t, --tag        Create a git tag for this version
	  -u, --git-push   Push changes upstream (and tags, if created)
	  -U, --publish    Publish to NPM
	  --assert-branch  Fail if active branch is not equal to specified branch
	
These are pretty self-explanatory. There are switches to commit to git, create a tag, push the results, and publish to NPM. These occur in the order you would expect: if you create a tag, the tag gets pushed; the published version contains the new version from package.json, etc.

`--assert-branch` requires the active git branch to be equal to the specified git branch before performing any destructive action.