[![Stories in Ready](https://badge.waffle.io/City-of-Raleigh-Public-Utilities/PUMPR.png?label=ready&title=Ready)](https://waffle.io/City-of-Raleigh-Public-Utilities/PUMPR)
![alt text](https://github.com/City-of-Raleigh-Public-Utilities/PUMPR/blob/master/client/assets/images/storehouse_logo-assets/storehouse.png "storehouse")
# What is storehouse?
Storehouse is designed to make city staff and engineering firms lives easier by providing a resource where all public utility project's source documentation can be easily found in one place.

### Documents Tracked

1. As-Builts
2. Acceptance Letter
3. Construction Plans
4. Permits
5. Plats
6. Statement of Cost
7. Warranty Letter


# Digital Submittals Standard
Save trips downtown and money on copies by using the digital submittal standard.

# Contribute

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and NPM](nodejs.org) >= v0.12.0
- [Bower](bower.io) (`npm install -g bower`)
- [Grunt](http://gruntjs.com/) (`npm install -g grunt-cli`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`

### Developing

1. Run `npm install` to install server dependencies.

2. Run `bower install` to install front-end dependencies.

3. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running

4. Run `grunt serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & Development

Run `grunt build` for building and `grunt serve` for preview.

## Testing

Running `npm test` will run the unit tests with karma.
