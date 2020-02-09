# Twitto_be

twitto_be is a real-time dashboard of geolocated tweets.

## Installation

Twitto.be is a node.js application.

Used ports:
* 8080: express
* 3031: socket.io

After cloning the repository, follow these steps

1. run `npm install`
2. Enter your twitter app credentials inside a new file `params.json` in the root directory. Use `params-sample.json` to see the expected syntax

### Development

run `npm start`

### Production

Deployment scripts are included, you may need to adapt them to your own setup. Edit `deploy:prod` scripts in `package.json` to modify the configuration:
* debian stable linux machine (may work in other unix environments)
* The application (`app.js`) is launched and maintained up by a systemd process called `node-twitto`
* The application is deployed in the following directory: `/home/srv-node-mango/twitto`
* The owner of `/home/srv-node-mango/twitto`, is user `srv-node-mango`

1. Run `npm run build`
2. If no error was met in previous step, run `npm run deploy:prod`

Similar script exists for a test environment ( `deploy:test` ).

## Contributing

Your participation is welcome.

* to **report bugs**, **make suggestions** or to **ask any question**, please enter a github issue. Please first [perform a search](https://github.com/Mango-information-systems/twitto_be/issues) before reporting an issue in order to avoid entering duplicates.
* to **correct issues**, **improve code**, send a pull request. Try to keep your commits clean. If you want to change any significant part of code and want it integrated inside twitto_be, please discuss about it before working on it.
