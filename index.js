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

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
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
function viewAllDpts() {}
function viewAllRoles() {}
function viewAllEmployees() {}
function addDpt() {}
function addEmployee() {}
function addRole() {}
function updateEmployee() {}
