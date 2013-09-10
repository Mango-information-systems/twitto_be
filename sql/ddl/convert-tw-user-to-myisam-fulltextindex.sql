
CREATE  TABLE  `twitto`.`tw_user_fti` (  `tw_id` int( 20  )  NOT  NULL ,
 `screen_name` varchar( 255  )  COLLATE utf8_unicode_ci  DEFAULT NULL ,
 `name` varchar( 255  )  COLLATE utf8_unicode_ci  DEFAULT NULL ,
 `description` varchar( 255  )  COLLATE utf8_unicode_ci  DEFAULT NULL ,
 `profile_image_url` varchar( 255  )  COLLATE utf8_unicode_ci  DEFAULT NULL ,
 `lang` varchar( 255  )  COLLATE utf8_unicode_ci  DEFAULT NULL ,
 `province_id` varchar( 255  )  COLLATE utf8_unicode_ci  DEFAULT NULL  COMMENT  'Id of the province parsed from user location',
 `klout_id` varchar( 255  )  COLLATE utf8_unicode_ci  DEFAULT NULL  COMMENT  'Klout user Id, is NULL when the user is missing from Klout',
 `klout_score` int( 20  ) unsigned  DEFAULT NULL  COMMENT  'Kred influence score',
 `last_update_klout` datetime  DEFAULT NULL  COMMENT  'Timestamp of last update of user Klout score',
PRIMARY  KEY (  `tw_id`  ) ,
UNIQUE  KEY  `klout_id` (  `klout_id`  )  ) ENGINE  = InnoDB  DEFAULT CHARSET  = utf8 COLLATE  = utf8_unicode_ci COMMENT  =  'twittos table used by front-end';


ALTER TABLE  `tw_user_fti` ENGINE = MYISAM;
ALTER TABLE  `tw_user_fti` ADD FULLTEXT (`screen_name`);
ALTER TABLE  `tw_user_fti` ADD FULLTEXT (`name`);
ALTER TABLE  `tw_user_fti` ADD FULLTEXT (`description`);

INSERT INTO  `tw_user_fti` SELECT * FROM tw_user;

DROP TABLE `tw_user`;

RENAME TABLE  `twitto`.`tw_user_fti` TO  `twitto`.`tw_user` ;