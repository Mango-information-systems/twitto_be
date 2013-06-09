# database behing twitto.be #

sql scripts to create the database, and initialize some dimensions.

database and user settings to be initialized in database creation script (folder ddl)

dml scripts to be executed in the following order:

	1. insert_dim_name_na_insert
	2. insert_dim_name_initial_load
	3. insert_dim_name_delta_load
