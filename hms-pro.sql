SHOW CON_NAME;
SELECT NAME, OPEN_MODE FROM V$PDBS;

ALTER SESSION SET CONTAINER = ORCLPDB;



CREATE USER hotelmanagement IDENTIFIED BY hotel123;

GRANT CONNECT, RESOURCE TO hotel;

GRANT CREATE SESSION TO hotelmanagement;
GRANT CREATE TABLE TO hotelmanagement;
GRANT CREATE SEQUENCE TO hotelmanagement;
GRANT CREATE VIEW TO hotelmanagement;
GRANT CREATE PROCEDURE TO hotelmanagement;
GRANT CREATE TRIGGER TO hotelmanagement;
GRANT CREATE SYNONYM TO hotelmanagement;

ALTER USER hotelmanagement QUOTA UNLIMITED ON USERS;

show user
SHOW CON_NAME;
SELECT username, account_status, common FROM dba_users WHERE username = 'HOTELMANAGEMENT';

INSERT INTO Admin VALUES (1, 'Admin', 'admin@example.com', 'admin123', 'admin', SYSTIMESTAMP, SYSTIMESTAMP);
COMMIT;
