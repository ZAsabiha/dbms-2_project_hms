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

CREATE TABLE Admin (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) NOT NULL UNIQUE,
    password VARCHAR2(255) NOT NULL,
    role VARCHAR2(50) DEFAULT 'admin' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO Admin VALUES (1, 'Admin', 'admin@example.com', 'admin123', 'admin', SYSTIMESTAMP, SYSTIMESTAMP);
COMMIT;

CREATE TABLE GUEST (
  GUEST_ID     NUMBER PRIMARY KEY,
  FULL_NAME    VARCHAR2(100) NOT NULL,
  PHONE        VARCHAR2(20) UNIQUE,
  EMAIL        VARCHAR2(120) UNIQUE,
  ADDRESS      VARCHAR2(200),
  CREATED_AT   DATE DEFAULT SYSDATE
);

CREATE TABLE HOTEL_UPDATES (
  UPDATE_ID   NUMBER PRIMARY KEY,
  TITLE       VARCHAR2(100) NOT NULL,
  MESSAGE     VARCHAR2(500) NOT NULL,
  VALID_UNTIL DATE DEFAULT ADD_MONTHS(SYSDATE, 1)
);
CREATE TABLE ROOM (
  ROOM_ID      NUMBER PRIMARY KEY,
  ROOM_NUMBER  VARCHAR2(10) NOT NULL,
  ROOM_TYPE    VARCHAR2(20) NOT NULL CHECK (ROOM_TYPE IN ('Single','Double','Deluxe','Suite')),
  BASE_PRICE   NUMBER(10,2) NOT NULL CHECK (BASE_PRICE > 0),
  FLOOR_NO     NUMBER,
  STATUS       VARCHAR2(20) DEFAULT 'Available' CHECK (STATUS IN ('Available','Occupied','Maintenance')),
  NOTES        VARCHAR2(200),
  CONSTRAINT ROOM_UNIQUE_NUMBER_FLOOR UNIQUE (ROOM_NUMBER, FLOOR_NO)
);

CREATE TABLE RESERVATION (
  RES_ID       NUMBER PRIMARY KEY,
  GUEST_ID     NUMBER NOT NULL,
  ROOM_ID      NUMBER NOT NULL,
  CHECK_IN     DATE NOT NULL,
  CHECK_OUT    DATE NOT NULL,
  STATUS       VARCHAR2(20) DEFAULT 'Booked' NOT NULL
                CHECK (STATUS IN ('Booked','CheckedIn','CheckedOut','Cancelled')),
  CREATED_AT   DATE DEFAULT SYSDATE,
  UPDATED_AT   DATE DEFAULT SYSDATE,
  CONSTRAINT FK_RES_GUEST FOREIGN KEY (GUEST_ID) REFERENCES GUEST(GUEST_ID),
  CONSTRAINT FK_RES_ROOM  FOREIGN KEY (ROOM_ID) REFERENCES ROOM(ROOM_ID),
  CONSTRAINT CK_RES_DATE CHECK (CHECK_OUT > CHECK_IN)
);
CREATE SEQUENCE GUEST_SEQ START WITH 1 INCREMENT BY 1 NOCACHE;

-- Special Promotions
INSERT INTO HOTEL_UPDATES (UPDATE_ID, TITLE, MESSAGE, VALID_UNTIL)
VALUES (3, 'Weekend Special', 'Enjoy a free breakfast buffet this weekend with every booking!', SYSDATE + 3);

INSERT INTO HOTEL_UPDATES (UPDATE_ID, TITLE, MESSAGE, VALID_UNTIL)
VALUES (4, 'Winter Package', 'Book a suite and get free spa access throughout December!', ADD_MONTHS(SYSDATE, 2));
commit;

INSERT INTO HOTEL_UPDATES (UPDATE_ID, TITLE, MESSAGE, VALID_UNTIL)
VALUES (1, 'Summer Offer', 'Get 20% off on all Deluxe Rooms!', ADD_MONTHS(SYSDATE, 1));

INSERT INTO HOTEL_UPDATES (UPDATE_ID, TITLE, MESSAGE, VALID_UNTIL)
VALUES (2, 'Check-in Reminder', 'Your reservation check-in starts tomorrow.', SYSDATE+1);

CREATE OR REPLACE TRIGGER GUEST_BI
BEFORE INSERT ON GUEST
FOR EACH ROW
BEGIN
  IF :NEW.GUEST_ID IS NULL THEN
    SELECT GUEST_SEQ.NEXTVAL INTO :NEW.GUEST_ID FROM DUAL;
  END IF;
END;
/silent

INSERT INTO GUEST (FULL_NAME, PHONE, EMAIL, ADDRESS)
VALUES ('John Doe', '01711111111', 'john.doe@mail.com', 'Dhaka, Bangladesh');

INSERT INTO GUEST (FULL_NAME, PHONE, EMAIL, ADDRESS)
VALUES ('Emma Watson', '01822222222', 'emma.w@mail.com', 'Chattogram, Bangladesh');

-- Example: generate bills manually for existing reservations
INSERT INTO BILL (BILL_ID, RES_ID, NIGHTS, RATE, TAXES, TOTAL, PAID)
SELECT 
    BILL_SEQ.NEXTVAL, 
    RES_ID,
    -- use your existing functions to compute nights, rate, taxes, total
    FN_STAY_DURATION(CHECK_IN, CHECK_OUT) AS NIGHTS,
    ROUND(FN_ESTIMATE_TOTAL(ROOM_ID, CHECK_IN, CHECK_OUT) / FN_STAY_DURATION(CHECK_IN, CHECK_OUT) / 1.10, 2) AS RATE,
    ROUND(FN_ESTIMATE_TOTAL(ROOM_ID, CHECK_IN, CHECK_OUT) - (FN_ESTIMATE_TOTAL(ROOM_ID, CHECK_IN, CHECK_OUT)/1.10), 2) AS TAXES,
    FN_ESTIMATE_TOTAL(ROOM_ID, CHECK_IN, CHECK_OUT) AS TOTAL,
    'N' AS PAID
FROM RESERVATION;
INSERT INTO ROOM (ROOM_NUMBER, ROOM_TYPE, BASE_PRICE, FLOOR_NO, STATUS, NOTES) VALUES ('103','Single', 4000, 1, 'Available', 'Garden view');
INSERT INTO ROOM (ROOM_NUMBER, ROOM_TYPE, BASE_PRICE, FLOOR_NO, STATUS, NOTES) VALUES ('104','Double', 5500, 1, 'Occupied', 'Street view');
INSERT INTO ROOM (ROOM_NUMBER, ROOM_TYPE, BASE_PRICE, FLOOR_NO, STATUS, NOTES) VALUES ('105','Single', 4000, 1, 'Available', 'Quiet corner');

INSERT INTO ROOM (ROOM_NUMBER, ROOM_TYPE, BASE_PRICE, FLOOR_NO, STATUS, NOTES) VALUES ('203','Double', 5500, 2, 'Available', 'City view');
INSERT INTO ROOM (ROOM_NUMBER, ROOM_TYPE, BASE_PRICE, FLOOR_NO, STATUS, NOTES) VALUES ('204','Deluxe', 8000, 2, 'Occupied', 'Premium balcony');
INSERT INTO ROOM (ROOM_NUMBER, ROOM_TYPE, BASE_PRICE, FLOOR_NO, STATUS, NOTES) VALUES ('205','Suite', 12000, 2, 'Available', 'Executive suite');

INSERT INTO ROOM (ROOM_NUMBER, ROOM_TYPE, BASE_PRICE, FLOOR_NO, STATUS, NOTES) VALUES ('302','Double', 5500, 3, 'Available', 'Top floor view');
INSERT INTO ROOM (ROOM_NUMBER, ROOM_TYPE, BASE_PRICE, FLOOR_NO, STATUS, NOTES) VALUES ('303','Deluxe', 8000, 3, 'Maintenance', 'Plumbing repair');
INSERT INTO ROOM (ROOM_NUMBER, ROOM_TYPE, BASE_PRICE, FLOOR_NO, STATUS, NOTES) VALUES ('304','Suite', 12000, 3, 'Available', 'Penthouse suite');
INSERT INTO ROOM (ROOM_NUMBER, ROOM_TYPE, BASE_PRICE, FLOOR_NO, STATUS, NOTES) VALUES ('305','Single', 4000, 3, 'Available', 'Compact room');


INSERT INTO RESERVATION_AUDIT (RES_ID, ACTION_NAME, OLD_STATUS, NEW_STATUS, ACTION_BY, DETAILS)
VALUES (301, 'UPDATE', 'Booked', 'CheckedIn', 'clara_recep', 'Guest checked in at front desk');

INSERT INTO RESERVATION_AUDIT (RES_ID, ACTION_NAME, OLD_STATUS, NEW_STATUS, ACTION_BY, DETAILS)
VALUES (306, 'UPDATE', 'CheckedIn', 'CheckedOut', 'clara_recep', 'Guest checked out, room cleaned');

INSERT INTO RESERVATION_AUDIT (RES_ID, ACTION_NAME, OLD_STATUS, NEW_STATUS, ACTION_BY, DETAILS)
VALUES (309, 'UPDATE', 'Booked', 'Cancelled', 'bob_manager', 'Guest requested cancellation due to emergency');

INSERT INTO RESERVATION_AUDIT (RES_ID, ACTION_NAME, OLD_STATUS, NEW_STATUS, ACTION_BY, DETAILS)
VALUES (307, 'UPDATE', 'CheckedIn', 'CheckedOut', 'clara_recep', 'Early checkout requested by guest');

INSERT INTO RESERVATION_AUDIT (RES_ID, ACTION_NAME, NEW_STATUS, ACTION_BY, DETAILS)
VALUES (305, 'INSERT', 'Booked', 'alice_admin', 'New reservation created via phone booking');

INSERT INTO BILL (RES_ID, NIGHTS, RATE, TAXES, TOTAL, PAID) 
VALUES (306, 3, 4000, 1200, 13200, 'Y');

INSERT INTO BILL (RES_ID, NIGHTS, RATE, TAXES, TOTAL, PAID) 
VALUES (307, 4, 12000, 4800, 52800, 'Y');

INSERT INTO BILL (RES_ID, NIGHTS, RATE, TAXES, TOTAL, PAID) 
VALUES (308, 3, 5500, 1650, 18150, 'Y');

-- Unpaid bills for current stays
INSERT INTO BILL (RES_ID, NIGHTS, RATE, TAXES, TOTAL, PAID) 
VALUES (303, 3, 8000, 2400, 26400, 'N');

INSERT INTO BILL (RES_ID, NIGHTS, RATE, TAXES, TOTAL, PAID) 
VALUES (304, 3, 8000, 2400, 26400, 'N');

-- Future booking bills (unpaid)
INSERT INTO BILL (RES_ID, NIGHTS, RATE, TAXES, TOTAL, PAID) 
VALUES (305, 4, 5500, 2200, 24200, 'N');

INSERT INTO BILL (RES_ID, NIGHTS, RATE, TAXES, TOTAL, PAID) 
VALUES (306, 4, 12000, 4800, 52800, 'N');

INSERT INTO BILL (RES_ID, NIGHTS, RATE, TAXES, TOTAL, PAID) 
VALUES (307, 4, 12000, 4800, 52800, 'N');


-- Example: generate bills manually for existing reservations
INSERT INTO BILL (BILL_ID, RES_ID, NIGHTS, RATE, TAXES, TOTAL, PAID)

-- Updated Procedure (replace BOOLEAN with NUMBER)
CREATE OR REPLACE PROCEDURE PROC_GENERATE_BILL1(
  p_res_id IN NUMBER,
  p_force  IN NUMBER DEFAULT 0  -- 1 = TRUE, 0 = FALSE
) IS
  v_exists NUMBER;
  v_room   NUMBER;
  v_in     DATE;
  v_out    DATE;
  v_nights NUMBER;
  v_total  NUMBER;
  v_rate   NUMBER;
  v_tax    NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_exists FROM BILL WHERE RES_ID = p_res_id;
  
  SELECT ROOM_ID, CHECK_IN, CHECK_OUT INTO v_room, v_in, v_out
  FROM RESERVATION WHERE RES_ID = p_res_id;
  
  v_nights := FN_STAY_DURATION(v_in, v_out);
  v_total  := FN_ESTIMATE_TOTAL(v_room, v_in, v_out);
  v_tax    := ROUND(v_total/1.10 * 0.10, 2);
  v_rate   := ROUND((v_total - v_tax)/v_nights, 2);
  
  IF v_exists = 0 THEN
    INSERT INTO BILL (BILL_ID, RES_ID, NIGHTS, RATE, TAXES, TOTAL, PAID)
    VALUES (BILL_SEQ.NEXTVAL, p_res_id, v_nights, v_rate, v_tax, v_total, 'N');
  ELSIF p_force = 1 THEN  -- Changed from p_force to p_force = 1
    UPDATE BILL 
       SET NIGHTS = v_nights, RATE = v_rate, TAXES = v_tax, TOTAL = v_total 
     WHERE RES_ID = p_res_id;
  END IF;
END;
/

CREATE OR REPLACE FUNCTION GET_RESERVATION_STATUS(
    P_RES_ID IN NUMBER
) RETURN VARCHAR2
IS
    V_STATUS VARCHAR2(20);
BEGIN
    SELECT STATUS
    INTO V_STATUS
    FROM RESERVATION
    WHERE RES_ID = P_RES_ID;

    RETURN V_STATUS;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'Reservation Not Found';
END;
/
CREATE OR REPLACE FUNCTION GET_RESERVATION_STATUS(
    P_RES_ID IN NUMBER
) RETURN VARCHAR2
IS
    V_STATUS VARCHAR2(20);
BEGIN
    SELECT STATUS
    INTO V_STATUS
    FROM RESERVATION
    WHERE RES_ID = P_RES_ID;

    RETURN V_STATUS;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'Reservation Not Found';
END;
/
CREATE OR REPLACE FUNCTION CHECK_AVAILABILITY(
    p_room_id IN NUMBER,
    p_check_in IN DATE,
    p_check_out IN DATE
) RETURN NUMBER
IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM RESERVATION
    WHERE ROOM_ID = p_room_id
      AND STATUS IN ('Booked','CheckedIn')
      AND (p_check_in < CHECK_OUT AND p_check_out > CHECK_IN);

    IF v_count = 0 THEN
        RETURN 1; -- available
    ELSE
        RETURN 0; -- not available
    END IF;
END;
/

CREATE OR REPLACE PROCEDURE CREATE_RESERVATION(
    p_room_id IN NUMBER,
    p_guest_id IN NUMBER,
    p_check_in IN DATE,
    p_check_out IN DATE
)
IS
    v_available NUMBER;
BEGIN
    v_available := CHECK_AVAILABILITY(p_room_id, p_check_in, p_check_out);

    IF v_available = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Room not available for selected dates');
    END IF;

    INSERT INTO RESERVATION (ROOM_ID, GUEST_ID, CHECK_IN, CHECK_OUT, STATUS)
    VALUES (p_room_id, p_guest_id, p_check_in, p_check_out, 'Booked');

    COMMIT;
END;
/



-- estimate cost
CREATE OR REPLACE FUNCTION ESTIMATE_COST(
    p_room_id NUMBER,
    p_check_in DATE,
    p_check_out DATE
) RETURN NUMBER
IS
    v_total NUMBER := 0;
    v_date DATE := p_check_in;
    v_rate NUMBER;
BEGIN
    WHILE v_date <= p_check_out LOOP
        -- get base price
        SELECT BASE_PRICE INTO v_rate
        FROM ROOM
        WHERE ROOM_ID = p_room_id;

        -- weekend 
        IF TO_CHAR(v_date,'DY','NLS_DATE_LANGUAGE=ENGLISH') IN ('SAT','SUN') THEN
            v_rate := v_rate * 1.10; -- +10% weekend
        END IF;

        --  (Oct-Dec)
        IF TO_CHAR(v_date,'MM') IN ('10','11','12') THEN
            v_rate := v_rate * 1.20; -- +20% peak month
        END IF;

        v_total := v_total + v_rate;
        v_date := v_date + 1;
    END LOOP;

    -- add tax 10%
    RETURN v_total * 1.10;
END;
/

CREATE SEQUENCE admin_seq
START WITH 1
INCREMENT BY 1
NOCACHE;

CREATE OR REPLACE TRIGGER admin_before_insert
BEFORE INSERT ON Admin
FOR EACH ROW
BEGIN
    IF :NEW.id IS NULL THEN
        :NEW.id := admin_seq.NEXTVAL;
    END IF;
END;
/

CREATE OR REPLACE FUNCTION CHECK_AVAILABILITY(
    p_room_id IN NUMBER,
    p_check_in IN DATE,
    p_check_out IN DATE
) RETURN NUMBER
IS
    v_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM RESERVATION
    WHERE ROOM_ID = p_room_id
      AND STATUS IN ('Booked','CheckedIn')
      AND (p_check_in < CHECK_OUT AND p_check_out > CHECK_IN);

    IF v_count = 0 THEN
        RETURN 1; -- available
    ELSE
        RETURN 0; -- not available
    END IF;
END;
