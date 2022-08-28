const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql2");
const Department = require("./lib/Department");
const Role = require("./lib/Role");
const Employee = require("./lib/Employee");
require("dotenv").config();

const connection = mysql.createConnection({
  host: "localhost",
  // MySQL username,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
            "Update an employee's role";
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
    console.table("\n", result);
    init();
  });
}
// function to view all roles with prepared statement for querying the relevant table
function viewAllRoles() {
  connection.query(`SELECT * FROM roles`, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table("\n", result);
    init();
  });
}
// function to view all employees with prepared statement for querying the relevant table
function viewAllEmployees() {
  connection.query(`SELECT * FROM employee`, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table("\n", result);
    init();
  });
}
// function to add a dept with prepared statement for adding info into dept table
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
        console.log(`\n ${department.name} has been added to the database`);
        init();
      });
    });
}
// function to add an employee with prepared statement for adding info into employee table
// I need to be able to extract all roles/manager id from database and display them in list in prompt
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
        console.log(
          `\n ${employee.firstName} ${employee.lastName} has been added to the database`
        );
        init();
      });
    });
}
// function to add a role with prepared statement for adding info into role table
// I need to be able to extract all role from database and display them in list in prompt
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
        choices: [], // I need to be able to extract all role from database and display them in list
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
        console.log(`\n ${role.name} has been added to the database`);
        init();
      });
    });
}
//need to work on this last function
function updateEmployee() {}
