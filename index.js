const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql2");
require("dotenv").config();

//Creating mysql connection with all sensitive info in .env doc
const connection = mysql.createConnection({
  host: "localhost",
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
        "Update an employee role",
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
  connection.query(
    `SELECT department.id, department.department_name AS Department FROM department`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.table("\n", result);
      init();
    }
  );
}
// function to view all roles with prepared statement for querying the relevant table
function viewAllRoles() {
  connection.query(
    `SELECT roles.id, roles.title AS Role, department.department_name AS Department, roles.salary AS Salary FROM roles JOIN department ON roles.department_id = department.id ORDER BY roles.id ASC;`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.table("\n", result);
      init();
    }
  );
}
// function to view all employees with prepared statement for querying the relevant table
function viewAllEmployees() {
  connection.query(
    `SELECT employee.id, employee.first_name AS FirstName, employee.last_name AS LastName, roles.title AS Role, department.department_name AS Department, roles.salary AS Salary, 
  CONCAT (manager.first_name, " ", manager.last_name) AS Manager
  FROM employee
  LEFT JOIN roles ON employee.role_id = roles.id
  LEFT JOIN department ON roles.department_id = department.id
  LEFT JOIN employee manager ON employee.manager_id = manager.id`,
    (err, result) => {
      if (err) {
        console.log(err);
      }
      console.table("\n", result);
      init();
    }
  );
}
// function to add a dept with prepared statement for adding info into dept table
async function addDpt() {
  const response = await inquirer.prompt([
    {
      type: "input",
      message: "What is the name of the department?",
      name: "departmentName",
    },
  ]);

  const department = response.departmentName;
  const sql = `INSERT INTO department (department_name)
  VALUES (?)`;

  connection.query(sql, department, (err) => {
    if (err) {
      console.log(`Error in adding department`);
    }
    console.log(`\n ${department} has been added to the database \n `);
    init();
  });
}

const getRoles = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT roles.title, roles.id FROM roles`;
    connection.query(sql, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

const getManagers = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT employee.first_name, employee.last_name, employee.id, employee.manager_id FROM employee WHERE employee.manager_id IS NULL`;
    connection.query(sql, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

// function to add an employee with prepared statement for adding info into employee table
async function addEmployee() {
  const roles = await getRoles();
  const managers = await getManagers();
  const response = await inquirer.prompt([
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
      choices: roles.map(({ title, id }) => ({
        name: title,
        value: id,
      })),
    },
    {
      type: "list",
      message: "Who is the manager of the employee?",
      name: "employeeManager",
      choices: managers.map(({ id, first_name, last_name }) => ({
        name: first_name + " " + last_name,
        value: id,
      })),
    },
  ]);

  const params = [
    response.employeeFirstName,
    response.employeeLastName,
    response.employeeRole,
    response.employeeManager,
  ];

  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
  VALUES (?,?,?,?)`;

  connection.query(sql, params, (err) => {
    if (err) {
      console.log(`Error in adding Employee`);
    }
    console.log(
      `\n ${response.employeeFirstName} ${response.employeeLastName} has been added to the database \n `
    );
    init();
  });
}

const getDpts = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT department.id, department.department_name FROM department`;
    connection.query(sql, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

// function to add a role with prepared statement for adding info into role table
async function addRole() {
  const departments = await getDpts();
  const response = await inquirer.prompt([
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
      name: "roleDpt",
      message: "What department is this role in?",
      choices: departments.map(({ department_name, id }) => ({
        name: department_name,
        value: id,
      })),
    },
  ]);

  const params = [response.roleName, response.roleSalary, response.roleDpt];

  const sql = `INSERT INTO roles (title, salary, department_id) VALUES (?, ?, ?)`;

  connection.query(sql, params, (err) => {
    if (err) throw err;
  });

  init();
}

const getEmployees = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;
    connection.query(sql, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

//gets the employee's name and get the role then assign new role
async function updateEmployee() {
  const employees = await getEmployees();
  const roles = await getRoles();
  const response = await inquirer.prompt([
    {
      type: "list",
      message: "Which employee would you like to update?",
      name: "employeeName",
      choices: employees.map(({ id, first_name, last_name }) => ({
        name: first_name + " " + last_name,
        value: id,
      })),
    },
    {
      type: "list",
      message: "What is the new role for this employee?",
      name: "updateRole",
      choices: roles.map(({ title, id }) => ({
        name: title,
        value: id,
      })),
    },
  ]);

  const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

  connection.query(sql, [response.updateRole, response.employeeName], (err) => {
    if (err) {
      console.log(`Error in updating Employee`);
    }
    console.log(`\n Role has been updated in the database \n `);
    init();
  });
}
