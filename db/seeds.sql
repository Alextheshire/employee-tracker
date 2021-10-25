INSERT INTO department (name)
VALUES
('Engineering'),
('Science'),
('Security'),
('Medical'),
('Command');

INSERT INTO role (title, salary, department_id)
VALUES
('Captain', 1000000,5),
('Head of Engineering', 500000, 1),
('Engine Tech', 90000, 1),
('Guard',75000,3),
('Doctor', 130000,4),
('Scientist', 110000, 2);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('James', 'Kirk',1, NULL),
('Tripp', "Travis", 2, 1),
('Guppy', 'Silver', 3, 2),
('Forp','Steele',4,1),
('Mick', 'Dreamy', 5,1),
('Amy', 'Poole', 6, 1);