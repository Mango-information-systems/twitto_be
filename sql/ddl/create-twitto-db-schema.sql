-- creation of twitto database structure

/*
drop table tw_user;
drop table dim_topic;
drop table dim_province;
drop table fact_topic;
drop table stg_tw_user;
drop table audit_etl;
*/

-- USE `twitto`;

-- production tables

CREATE TABLE IF NOT EXISTS `tw_user` (
  `tw_id` int(20) NOT NULL,
  `screen_name` varchar(255),
  `name` varchar(255),
  `description` varchar(255),
  `profile_image_url` varchar(255),
  `lang` varchar(255),
  `province_id` varchar(255) COMMENT 'Id of the province parsed from user location',
  `klout_id` varchar(255) COMMENT 'Klout user Id, is NULL when the user is missing from Klout',
  `klout_score` int(20) unsigned COMMENT 'Klout influence score',
  `last_update_klout` datetime COMMENT 'Timestamp of last update of user Klout score',
  PRIMARY KEY (`tw_id`),
  UNIQUE (`klout_id`)
)
ENGINE=MYISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT 'twittos table used by front-end';

ALTER TABLE `tw_user` ADD FULLTEXT (`screen_name`, `name`, `description`);

CREATE TABLE IF NOT EXISTS `dim_topic` (
  `topic_id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'Id of the topic',
  `klout_topic_id` varchar(255) NOT NULL COMMENT 'Id of the topic in Kout system',
  `topic_type` varchar(255) COMMENT 'type of topic: "sub" for subject, or "entity"',
  `slug` varchar(255) COMMENT 'topic slug to be used in the url',
  `display_name` varchar(255) COMMENT 'display name of the topic',
  `image_url` varchar(255) COMMENT 'topic thumbnail image url',
  PRIMARY KEY (`topic_id`),
  UNIQUE (`klout_topic_id`)
)
DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT 'topics dimension table';

CREATE TABLE IF NOT EXISTS `dim_province` (
  `province_id` int(10) NOT NULL AUTO_INCREMENT COMMENT 'Id of the province',
  `province_name` varchar(255) COMMENT 'name of the province',
  PRIMARY KEY (`province_id`)
)
DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT 'Belgian provinces';

CREATE TABLE IF NOT EXISTS `fact_topic` (
  `tw_id` int(20) NOT NULL COMMENT 'Twitter user Id (numeric)',
  `topic_id` int(20) NOT NULL COMMENT 'topic id',
  `last_update` datetime NULL COMMENT 'timestamp of last update of the kred score',
  PRIMARY KEY (`tw_id`, `topic_id`)
)
DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT='fact table linking users to associated topics';

-- technical tables

CREATE TABLE IF NOT EXISTS `stg_tw_user` (
  `id` int(20) NOT NULL,
  `screen_name` varchar(255),
  `name` varchar(255),
  `description` varchar(255),
  `location` varchar(255),
  `lang` varchar(255),
  `id_str` varchar(255),
  `url` varchar(255),
  `created_at` varchar(255),
  `statuses_count` int(20) unsigned,
  `followers_count` int(20) unsigned,
  `friends_count` int(20) unsigned,
  `favourites_count` int(20) unsigned,
  `listed_count` int(20) unsigned,
  `time_zone` varchar(255),
  `utc_offset` int(20) unsigned,
  `notifications` tinyint(1),
  `contributors_enabled` tinyint(1),
  `verified` tinyint(1),
  `is_translator` tinyint(1),
  `protected` tinyint(1),
  `geo_enabled` tinyint(1),
  `show_all_inline_media` tinyint(1),
  `default_profile_image` tinyint(1),
  `default_profile` tinyint(1),
  `profile_image_url` varchar(255),
  `profile_image_url_https` varchar(255),
  `profile_link_color` varchar(255),
  `profile_text_color` varchar(255),
  `profile_background_color` varchar(255),
  `profile_use_background_image` tinyint(1),
  `profile_background_image_url` varchar(255),
  `profile_background_image_url_https` varchar(255),
  `profile_background_tile` tinyint(1),
  `profile_sidebar_border_color` varchar(255),
  `profile_sidebar_fill_color` varchar(255),
  `last_update` datetime COMMENT 'Timestamp of last update of user info',
  `deleted` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'flag telling whether the user is deleted from twitter',
  PRIMARY KEY (`id`)
)
DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT 'staging table storing all tw_user info';

CREATE TABLE IF NOT EXISTS `audit_etl` (
  `process_name` varchar(255),
  `last_run` datetime COMMENT 'Records the timestamp of last successful run of a process'
)
DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT 'audit table tracking status of data integration processes';
