BEGIN TRANSACTION;
CREATE TABLE dataType (id INTEGER PRIMARY KEY, dataType TEXT);
CREATE TABLE relationship (id INTEGER, head INTEGER, tail INTEGER);
CREATE TABLE string (id INTEGER, string TEXT);

INSERT INTO dataType VALUES (123, "dataType");
INSERT INTO dataType VALUES (456, "relationship");
INSERT INTO dataType VALUES (789, "string");

INSERT INTO relationship VALUES (456, 123, 789);

INSERT INTO string VALUES (789, "Hello World");

COMMIT TRANSACTION;
