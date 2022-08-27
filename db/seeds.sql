INSERT INTO department (id, department_name)
VALUES (1, 'Accounting'),(2, 'Marketing'), (3, 'Sales'), (4, 'Customer Relations'), (5, 'Human Resources');

INSERT INTO roles (id, title, salary, department_id)
VALUES (11, 'Accountant', 63650, 1), (12, 'Customer Liaison', 70600, 4), (13, 'HR Officer', 68000, 5), (14, 'HR Manager', 80000, 5), (15, 'Sales Manager', 88000, 3),
(16, 'Marketing Manager', 90000, 2), (17, 'Marketing Officer', 77000, 2), (10, 'Accounting Manager', 86000, 1), (18, 'Sales Representative', 66000, 3);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES (112, 'Jane', 'Austen', 14, null), (113, 'Charlotte', 'Bronte', 16, null), (114, 'Virginia', 'Woolf', 10, null), (115, 'Simone', 'De Beauvoir', 15, null), (116, 'John', 'Doe', 13, 114), (117, 'Elvis', 'Doe', 18, 115),
(118, 'Tim', 'Onsentap', 17, 112);
