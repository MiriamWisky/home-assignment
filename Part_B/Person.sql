-- Creates the `family.Person` table to store individuals and their basic family references.

CREATE SCHEMA IF NOT EXISTS family;

CREATE TABLE family.Person (
    Person_Id     INT PRIMARY KEY,
    Personal_Name TEXT,
    Family_Name   TEXT,
    Gender        TEXT,
    Father_Id     INT REFERENCES family.Person(Person_Id),
    Mother_Id     INT REFERENCES family.Person(Person_Id),
    Spouse_Id     INT REFERENCES family.Person(Person_Id)
);


INSERT INTO family.Person (Person_Id, Personal_Name, Family_Name, Gender, Father_Id, Mother_Id, Spouse_Id) VALUES
(1,  'ראובן',  'כהן',   'זכר', NULL, NULL, 2), 
(2,  'שפרה',    'כהן',   'נקבה', NULL, NULL, NULL), 

(3,  'לוי',   'כהן',   'זכר', 1, 2, NULL),  
(4,  'יהודה',   'כהן',   'זכר', 1, 2, NULL), 
(5,  'פועה',   'כהן',   'נקבה', 1, 2, NULL), 

(6,  'מרים',    'לוי',   'נקבה', NULL, NULL, 7), 
(7,  'יששכר',  'לוי',   'זכר', NULL, NULL, 6), 

(8,  'רבקה',   'כהן',   'נקבה', 4, 6, NULL), 
(9,  'זבולון',   'כהן',   'זכר', 4, 6, NULL), 

(10, 'יוסי',    'ישראל',   'זכר', NULL, NULL, NULL);  
