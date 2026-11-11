-- ==========================================================
-- Oracle Database 3-Tier Demo: Optional User Setup Script
-- (Run this as SYS or SYSTEM if setting up a fresh schema manually)
-- ==========================================================

-- Alter session to PDB if using Oracle 12c+ Multitenant
-- ALTER SESSION SET CONTAINER = FREEPDB1;

-- Create demo user
BEGIN
    EXECUTE IMMEDIATE 'CREATE USER poc_user IDENTIFIED BY poc_password';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -1920 THEN -- User already exists
            RAISE;
        END IF;
END;
/

-- Grant privileges
GRANT CONNECT, RESOURCE, DBA TO poc_user;
GRANT UNLIMITED TABLESPACE TO poc_user;

COMMIT;
