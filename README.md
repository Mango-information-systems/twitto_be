# Twitto_be

twitto_be is a real-time twitter monitoring dashboard, performing live social network analysis on hashtags.

## Installation

Twitto.be is a `node.js` application.

After cloning the repository, follow these steps:

1. run `npm install`
2. Create and complete a `params.json` file in the root directory, using `params-sample.json` as a base:
  * `ports`: the ports express.js and socket.io should listen to.
  * `monitor`: definition of the tweets to monitor, one or more of the following:
	 * `monitor.description`: user-friendly description of the tracked topics.
	 * `monitor.isLowVolume` (boolean): whether or not the volume of tweets is expected to be important. If `false`, then the overlap prevention will be disabled during realtime mode, and only enabled when in pause.
	  * `monitor.track`: set of keywords to monitor in the twitter streaming API. Phrases may be used - see Twitter's [`track` stream parameter documentation for details](https://developer.twitter.com/en/docs/tweets/filter-realtime/guides/basic-stream-parameters#track) (optional).
	  * `monitor.list`: Id of a twitter list whose users' tweets should be monitored (optional)
	  * `monitor.boundingBox`: geolocation coordinates box to monitor in the twitter streaming API (optional).
  * `twitter`: enter your twitter app credentials.
  * update the other contents of the file as suitable.

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
