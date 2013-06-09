-- creation of twitto user and database

-- user creation
CREATE USER 'twitto_user'@'localhost' IDENTIFIED BY 'xxxxxx';

-- database creation
create database twitto;

ALTER DATABASE twitto CHARACTER SET utf8 COLLATE utf8_general_ci;

GRANT DELETE, INSERT, SELECT, UPDATE ON twitto.* TO `twitto_user`@`localhost`;
