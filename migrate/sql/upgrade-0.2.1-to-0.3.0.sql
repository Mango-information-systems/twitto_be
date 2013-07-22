--update from 0.2.1 to 0.3.0
alter table fact_influence ADD UNIQUE KEY `tw_id_categ` (`tw_id`,`main_category_id`), ADD KEY `kred_score` (`kred_score`);
