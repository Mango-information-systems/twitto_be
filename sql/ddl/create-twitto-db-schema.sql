-- creation of twitto database structure

/*
drop table tw_user;
drop table lkp_location;
drop table category;
drop table location;
drop table fact_influence;
drop table fact_category;
*/

USE `twitto`;

CREATE TABLE IF NOT EXISTS `tw_user` (
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
  `last_update` datetime,
  PRIMARY KEY (`id`)
)
DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `lkp_location` (
  `location_id` int(20) NOT NULL COMMENT 'Id of the location',
  `dirty_name` varchar(255) COMMENT 'name of the cleansed location not cleansed',
  PRIMARY KEY (`location_id`, `dirty_name`)
)
DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT 'bridge table between twitter''s uncleansed locations and cleansed locations';


CREATE TABLE IF NOT EXISTS `category` (
  `category_id` int(20) NOT NULL AUTO_INCREMENT COMMENT 'Id of the category',
  `category_name` varchar(255) COMMENT 'name of the category',
  `category_description` varchar(1020) COMMENT 'description of the category',
  `sorting_order` int(20) COMMENT 'sort order for display of categories',
  PRIMARY KEY (`category_id`)
)
DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT 'categories dimension table, populated using geonames responses usint Open MapQuest API';

CREATE TABLE IF NOT EXISTS `location` (
  `location_id` int(20) NOT NULL AUTO_INCREMENT COMMENT 'Id of the location',
  `location_name` varchar(255) COMMENT 'label at leaf level',
  `location_type` varchar(255) COMMENT 'type of location',
  `admin_area_1` varchar(255) COMMENT 'name of admin area 1',
  `admin_area_1_type` varchar(255) COMMENT 'type of admin area 1 (most likely country)',
  `admin_area_3` varchar(255) COMMENT 'name of admin area 3',
  `admin_area_3_type` varchar(255) COMMENT 'type of admin area 1 (most likely state)',
  `admin_area_4` varchar(255) COMMENT 'name of admin area 4',
  `admin_area_4_type` varchar(255) COMMENT 'type of admin area 1 (most likely county)',
  `admin_area_5` varchar(255) COMMENT 'name of admin area 5',
  `admin_area_5_type` varchar(255) COMMENT 'type of admin area 1 (most likely city)',
  `postal_code` varchar(255) COMMENT 'postal code',
  PRIMARY KEY (`location_id`)
)
DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci COMMENT 'locations hierarchy dimension table, populated using geonames responses using Open MapQuest API';

alter table `location` add unique index(`location_name`, `location_type`, `admin_area_1`);

CREATE TABLE IF NOT EXISTS `fact_influence` (
  `tw_id` int(20) NOT NULL COMMENT 'Twitter user Id (numeric)',
  `main_category_id` int(20) NOT NULL COMMENT 'category id for the user''s main category',
  `location_id` int(20) NOT NULL COMMENT 'id of the user''s location',
  `b_score` int(20) NOT NULL COMMENT 'twitto influence score',
  `kred_score` int(20) NOT NULL COMMENT 'Kred influence score',
  `kred_outreach` int(20) NOT NULL COMMENT 'Kred outreach score',
  `last_update` datetime COMMENT 'timestamp of last update of the kred score',
  PRIMARY KEY (`tw_id`)
)
DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci 
COMMENT='influence fact table, measuring influence of twitter users from Kred, and from twitto''s users rating';

CREATE TABLE IF NOT EXISTS `fact_category` (
  `tw_id` int(20) NOT NULL COMMENT 'Twitter user Id (numeric)',
  `category_id` int(20) NOT NULL COMMENT 'category id',
  `is_main` tinyint(1) COMMENT 'flag indicated whether this is to be considered as the main category of the person',
  PRIMARY KEY (`tw_id`, `category_id`)
)
DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci 
COMMENT='categories fact table, storing relationship between twitter users and categories';
