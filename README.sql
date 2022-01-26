-- postrgesql commands --

-- for help: \?

-- to list databases: \l

-- to create database: CREATE DATABASE database_name

-- to connect to database: \c database_name

-- example for create table: 
    CREATE TABLE table_name (
        id BIGSERIAL NOT NULL PRIMARY KEY, 
        column_name VARCHAR(50) NOT NULL,
        column_name BOOLEAN NOT NULL,
        column_name INT NOT NULL CHECK(price_range >= 1 AND price_range <= 5)
    );

-- to list tables: \d

-- to list table columns: \d table_name

-- example for adding columns:
    ALTER TABLE table_name ADD COLUMN column_name data_type;

-- example for deleting columns:
    ALTER TABLE table_name DROP COLUMN column_name;

-- example for deleting table:
    DROP TABLE table_name;

-- insert example
    INSERT INTO table_name (column_name, column_name, column_name)
        VALUES (
           value1, value2, value3
        );
            
