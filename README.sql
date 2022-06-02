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
        column_name INT NOT NULL CHECK(column_name >= 1 AND column_name <= 5)
    );

-- example for creating table with foreign key constraints
    CREATE TABLE reviews (
            id BIGSERIAL NOT NULL PRIMARY KEY,
            column_name BIGINT NOT NULL REFERENCES referenced_table_name(referenced_table_column_name),
            column_name VARCHAR(50) NOT NULL,
            column_name TEXT NOT NULL,
            column_name INT NOT NULL CHECK(column_name >= 1 AND column_name <= 5)
        ); 

-- to list tables: \d

-- to list table columns: \d table_name

-- example for adding columns:
    ALTER TABLE table_name ADD COLUMN column_name data_type;

-- example for setting column with the NOT NULL constraint when altering table
    ALTER TABLE table_name ADD COLUMN column_name data_type NOT NULL DEFAULT 52;
    ALTER TABLE table_name ALTER COLUMN column_name DROP DEFAULT;

-- example for updating column data type
    ALTER TABLE table_name ALTER COLUMN column_name TYPE data_type;

-- example for deleting columns:
    ALTER TABLE table_name DROP COLUMN column_name;

-- example for deleting table:
    DROP TABLE table_name;

-- insert example
    INSERT INTO table_name (column_name, column_name, column_name)
        VALUES (
           value1, value2, value3
        );


