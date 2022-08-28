// WHEN I start the application
// THEN I am presented with the following options: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
// WHEN I choose to view all departments
// THEN I am presented with a formatted table showing department names and department ids
// WHEN I choose to view all roles
// THEN I am presented with the job title, role id, the department that role belongs to, and the salary for that role
// WHEN I choose to view all employees
// THEN I am presented with a formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
// WHEN I choose to add a department
// THEN I am prompted to enter the name of the department and that department is added to the database
// WHEN I choose to add a role
// THEN I am prompted to enter the name, salary, and department for the role and that role is added to the database
// WHEN I choose to add an employee
// THEN I am prompted to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
// WHEN I choose to update an employee role
// THEN I am prompted to select an employee to update and their new role and this information is updated in the database
const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql2");
const Department = require("./lib/Department");
const Role = require("./lib/Role");
const Employee = require("./lib/Employee");

const connection = mysql.createConnection({
  host: "localhost",
  // MySQL username,
  user: "root",
  // TODO: Add MySQL password here
  password: "",
  database: "company_db",
});

// function init with all options to choose from
init = () => {
  return inquirer
    .prompt({
      type: "list",
      message: "What would you like to do?",
      name: "viewAll",
      choices: [
        "View all departments",
        "View all Roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Update and employee role",
      ],
    })
    .then(
      (makeChoice = (response) => {
        switch (response.viewAll) {
          case "View all departments":
            return viewAllDpts();

          case "View all Roles":
            return viewAllRoles();

          case "View all employees":
            return viewAllEmployees();

          case "Add a department":
            return addDpt();

          case "Add a role":
            return addRole();

          case "Add an employee":
            return addEmployee();

          default:
            "Update and employee role";
            return updateEmployee();
        }
      })
    );
};

init();
// function to view all departments with prepared statement for querying the relevant table
function viewAllDpts() {
  connection.query(`SELECT * FROM department`, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(result);
    init();
  });
}
// function to view all roles with prepared statement for querying the relevant table
function viewAllRoles() {
  connection.query(`SELECT * FROM roles`, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(result);
    init();
  });
}
// function to view all employees with prepared statement for querying the relevant table
function viewAllEmployees() {
  connection.query(`SELECT * FROM employee`, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table(result);
    init();
  });
}

function addDpt() {
  return inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the department?",
        name: "departmentName",
      },
    ])
    .then((response) => {
      const department = new Department(response.departmentName);
      const sql = `INSERT INTO department (department_name)
  VALUES (?)`;
      const params = [department.name];
      connection.query(sql, params, (err) => {
        if (err) {
          console.log(`Error in adding department`);
        }
        console.log(`Department has been added`);
        init();
      });
    });
}

function addEmployee() {
  return inquirer
    .prompt([
      {
        type: "input",
        message: "What is the employee's first name?",
        name: "employeeFirstName",
      },
      {
        type: "input",
        message: "What is the employee's last name?",
        name: "employeeLastName",
      },
      {
        type: "list",
        message: "What is the role of the employee?",
        name: "employeeRole",
        choices: [
          "Accountant",
          "Customer Liaison",
          "Marketing Officer",
          "HR Officer",
          "Sales Reprensentative",
        ],
      },
      {
        type: "list",
        message: "Who is the manager of the employee?",
        name: "employeeManager",
        choices: ["Simone de Beauvoir", "Virginia Woolf"],
      },
    ])
    .then((response) => {
      const employee = new Employee(
        response.employeeFirstName,
        response.employeeLastName,
        response.employeeRole,
        response.employeeManager
      );
      const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
  VALUES (?)`;
      const params = [
        employee.firstName,
        employee.lastName,
        employee.role,
        employee.manager,
      ];
      connection.query(sql, params, (err) => {
        if (err) {
          console.log(`Error in adding Employee`);
        }
        console.log(`Employee has been added`);
        init();
      });
    });
}

function addRole() {
  return inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the role?",
        name: "roleName",
      },
      {
        type: "input",
        message: "What is the salary of the role?",
        name: "roleSalary",
      },
      {
        type: "list",
        message: "Which department does the role belong to?",
        name: "roleDpt",
        choices: [],
      },
    ])
    .then((response) => {
      const role = new Role(
        response.roleName,
        response.roleSalary,
        response.roleDpt
      );
      const sql = `INSERT INTO role (title, salary, department)
  VALUES (?)`;
      const params = [role.name, role.salary, role.department];
      connection.query(sql, params, (err) => {
        if (err) {
          console.log(`Error in adding Role`);
        }
        console.log(`Role has been added`);
        init();
      });
    });
}

function updateEmployee() {}
