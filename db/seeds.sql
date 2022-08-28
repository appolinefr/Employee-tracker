INSERT INTO department (department_name)
VALUES ('Accounting'),('Marketing'), ('Sales'), ('Customer Relations'), ('Human Resources');

INSERT INTO roles (title, salary, department_id)
VALUES ('Accountant', 63650, 1), ('Customer Liaison', 70600, 4), ('HR Officer', 68000, 5), ('HR Manager', 80000, 5), ('Sales Manager', 88000, 3),
('Marketing Manager', 90000, 2), ('Marketing Officer', 77000, 2), ('Accounting Manager', 86000, 1), ('Sales Representative', 66000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Jane', 'Austen', 6, null), ('Charlotte', 'Bronte', 4, null), ('Virginia', 'Woolf', 5, null), ('Simone', 'De Beauvoir', 8, null), ('John', 'Doe', 9, 2), ('Elvis', 'Doe', 1, 3),
('Tim', 'Onsentap', 3, 1);
