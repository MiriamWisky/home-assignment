-- Adds missing reciprocal spouse relationships to ensure both sides of the couple are represented in the relationship table.

INSERT INTO family.Family_Relationships (Person_Id, Relative_Id, Connection_Type)
SELECT
    s.Person_Id AS Person_Id,    
    p.Person_Id AS Relative_Id,  
    CASE p.Gender
        WHEN 'זכר' THEN 'בן זוג'
        WHEN 'נקבה' THEN 'בת זוג'
        ELSE 'בן/בת זוג'
    END AS Connection_Type
FROM family.Person p
JOIN family.Person s ON p.Spouse_Id = s.Person_Id
WHERE p.Spouse_Id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM family.Family_Relationships fr
      WHERE fr.Person_Id = s.Person_Id
        AND fr.Relative_Id = p.Person_Id
        AND fr.Connection_Type IN ('בן זוג', 'בת זוג', 'בן/בת זוג')
  );
