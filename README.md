# Twitto_be #

twitto_be (pronounce *tweet-to-be*) is an online directory of twitter users aimed at helping search and identify active twitter users. People are browsable by influence score, topics, location or keywords.

You can use it to create your own directory.

A demo can be seen at [twitto.be](http://twitto.be), where close to 100000 Belgian twitter users are referenced.

This repository contains the website's structure and logic. Individual twitter users and related information is not included. You can use the `node.js` code included as a base to extract twitter users and populate your own directory.

## Installation ##

twitto_be website is in `php` and uses Laravel framework. Data is stored in a `mysql` database. `node.js` processes take care of updating the data. contact us or open an issue if you encounter any problem during the installation.

### database

The database creation scripts are in the folder `sql`. 

### website (laravel PHP)

The website itself is contained in the directory `site`. [php composer](http://getcomposer.org/) is a dependency and should be installed. After checking-out the repository, you should run the following from the folder `site`:

1. run `php composer.phar install`
2. run `php artisan config:publish jasonlewis/basset`
3. generate a random 32 characters string and set it in `site/app/config/app.php`  (5th parameter, 'key')
4. update `site/app/config/database.php` with your database connection information
5. update `site/app/config/mail.php` with your email server information
6. update the google analytics tracking code in `twitto_be/site/app/views/_layouts/default.blade.php`, at line 31
7. update the feedback form's email address in line 59 of `site/app/controllers/HomeController.php` (email address to which the feedback messages should be sent)
8. make sure that all files and directories are readable by the server's user. folder `site/app/storage` and its content should also have write permissions
9. Configure your web server (apache, nginx) to serve the location `site`

If you need help to customize the map display, have a look at @mbostock's [article](http://bost.ocks.org/mike/map/)

### data update processes (node.js)

The data updates processes do the following: 

* update twittos information (using twitter API)
* update klout scores (using Klout API)

`node.js` should be installed, you also need to have twitter API keys and klout API keys. Everything regarding data updates is stored in the folder `data-processing`.

Install dependencies using `npm`: `npm install`

Enter your API keys and database information inside file `data_processing/params.json`

twitter users information is updated in two steps: `data-processing/et-tw_user.js` should first run, then `data-processing/l-tw_user.js`. The first process extracts all metadata about the twitter users in a staging table, while the second one updates the users table used in production.

`data-processing/etl-klout-scores.js` updates Klout scores. It automatically resumes after rate limits are expired, which means you can launch the process only once and not worry about it afterwards, it will keep the Klout scores up-to-date continuously. You can use [forever](https://github.com/nodejitsu/forever) or a similar tool to have it running on a server.

Logic to assign twittos to topics and to locations is not included as it contains some custom sauce. Contact us if you need help in setting them.

## Contributing ##

Your participation is welcome.

* to **report bugs**, **make suggestions** or to **ask any question**, please enter a github issue. Please first [perform a search](https://github.com/Mango-information-systems/twitto_be/issues#js-command-bar-field) before reporting an issue in order to avoid entering duplicates.
* to **correct issues**, **improve code**, send a pull request. Try to keep your commits small. If you want to change any significant part of code and want it integrated inside twitto_be, please discuss about it before working on it.

