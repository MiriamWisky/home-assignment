-- Builds the `family.Family_Relationships` table with all first-degree relationships (parent, child, sibling, spouse).
CREATE TABLE family.Family_Relationships (
    Person_Id INT REFERENCES family.Person(Person_Id),
    Relative_Id INT REFERENCES family.Person(Person_Id),
    Connection_Type TEXT,
    PRIMARY KEY (Person_Id, Relative_Id, Connection_Type)
);

INSERT INTO family.Family_Relationships (Person_Id, Relative_Id, Connection_Type)
SELECT
    p.Person_Id,
    p.Father_Id AS Relative_Id,
    'אב' AS Connection_Type
FROM family.Person p
WHERE p.Father_Id IS NOT NULL

UNION ALL

SELECT
    p.Person_Id,
    p.Mother_Id AS Relative_Id,
    'אם' AS Connection_Type
FROM family.Person p
WHERE p.Mother_Id IS NOT NULL

UNION ALL

SELECT
    p.Person_Id AS Person_Id, 
    c.Person_Id AS Relative_Id, 
    CASE c.Gender
        WHEN 'זכר' THEN 'בן'
        WHEN 'נקבה' THEN 'בת'
        ELSE 'ילד'
    END AS Connection_Type
FROM family.Person p
JOIN family.Person c
    ON c.Father_Id = p.Person_Id OR c.Mother_Id = p.Person_Id

UNION ALL

SELECT
    a.Person_Id,
    b.Person_Id AS Relative_Id,
    CASE b.Gender
        WHEN 'זכר' THEN 'אח'
        WHEN 'נקבה' THEN 'אחות'
        ELSE 'אח/ות'
    END AS Connection_Type
FROM family.Person a
JOIN family.Person b
    ON (a.Father_Id = b.Father_Id
    OR a.Mother_Id = b.Mother_Id) -- Allowing siblings from one parent.
    AND a.Person_Id <> b.Person_Id

UNION ALL

SELECT
    p.Person_Id,
    p.Spouse_Id AS Relative_Id,
    CASE s.Gender
        WHEN 'זכר' THEN 'בן זוג'
        WHEN 'נקבה' THEN 'בת זוג'
        ELSE 'בן/בת זוג'
    END AS Connection_Type
FROM family.Person p
JOIN family.Person s ON p.Spouse_Id = s.Person_Id
WHERE p.Spouse_Id IS NOT NULL;
