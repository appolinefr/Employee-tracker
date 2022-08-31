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
        "View employees by manager",
        "Update employee's manager",
        "View employees per department",
        "Delete an employee, role or department",
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

          case "View employees per department":
            return viewEmployeeDpt();

          case "Update employee's manager":
            return updateManager();

          case "View employees by manager":
            return viewEmployeeManager();

          case "Delete an employee, role or department":
            return deleteFromDb();

          default:
            "Update an employee's role";
            return updateEmployee();
        }
      })
    );
};

init();

//functions to view dpts, roles and employees from the database

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

// View employees by department.
async function viewEmployeeDpt() {
  const departments = await getDpts();
  const response = await inquirer.prompt([
    {
      type: "list",
      name: "employeeDpt",
      message: "Which department would you like to see?",
      choices: departments.map(({ department_name, id }) => ({
        name: department_name,
        value: id,
      })),
    },
  ]);

  const sql =
    "SELECT employee.first_name, employee.last_name FROM employee JOIN roles ON roles.department_id WHERE roles.department_id = ? ";

  connection.query(sql, response.employeeDpt, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table("\n", result);
    init();
  });
}

// View employees by manager.
async function viewEmployeeManager() {
  const managers = await getManagers();
  const response = await inquirer.prompt([
    {
      type: "list",
      message: "Which manager would you like to choose?",
      name: "employeeManager",
      choices: managers.map(({ id, first_name, last_name }) => ({
        name: first_name + " " + last_name,
        value: id,
      })),
    },
  ]);

  const sql =
    "SELECT employee.first_name, employee.last_name FROM employee WHERE employee.manager_id = ? ";

  connection.query(sql, response.employeeManager, (err, result) => {
    if (err) {
      console.log(err);
    }
    console.table("\n", result);
    init();
  });
}

//functions to add information to database

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

const getDpts = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT * FROM department`;
    connection.query(sql, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

const getEmployees = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name FROM employee`;
    connection.query(sql, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

//Getting the employees excluding managers
const getEmpOnly = () => {
  return new Promise((resolve, reject) => {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name FROM employee WHERE employee.manager_id IS NOT NULL`;
    connection.query(sql, (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

// function to add a dept
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

// function to add an employee
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

// function to add a role
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
    if (err) {
      console.log(`Error in adding role`);
    }
    console.log(`\n Role has been updated in the database \n `);
    init();
  });

  init();
}

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

// Update employee managers.
async function updateManager() {
  const employees = await getEmpOnly();
  const managers = await getManagers();
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
      message: "What is the new manager for this employee?",
      name: "updateManager",
      choices: managers.map(({ id, first_name, last_name }) => ({
        name: first_name + " " + last_name,
        value: id,
      })),
    },
  ]);

  const sql = `UPDATE employee SET manager_id = ? WHERE id = ?`;

  connection.query(
    sql,
    [response.updateManager, response.employeeName],
    (err) => {
      if (err) {
        console.log(`Error in updating manager`);
      }
      console.log(`\n Manager has been updated in the database \n `);
      init();
    }
  );
}

//Functions to delete from database

//init function to delete from database
function deleteFromDb() {
  return inquirer
    .prompt([
      {
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: ["Delete a role", "Delete a department", "Delete an employee"],
      },
    ])

    .then(
      (makeChoice = (response) => {
        switch (response.choice) {
          case "Delete a role":
            return deleteRole();

          case "Delete an employee":
            return deleteEmp();

          case "Delete a department":
            return deleteDpt();
        }
      })
    );
}

// function to delete a department
async function deleteDpt() {
  const departments = await getDpts();
  const response = await inquirer.prompt([
    {
      type: "list",
      name: "dptDelete",
      message: "Which Department would you like to delete?",
      choices: departments.map(({ department_name, id }) => ({
        name: department_name,
        value: id,
      })),
    },
  ]);

  const sql = `DELETE FROM department WHERE id = ?`;
  console.log(response.dptDelete);

  connection.query(sql, response.dptDelete, (err) => {
    if (err) {
      console.log(`Error in deleting department`);
    } else {
      console.log(`\n Department has been deleted from the database \n `);
    }
    init();
  });
}

//function to delete a role
async function deleteRole() {
  const roles = await getRoles();
  const response = await inquirer.prompt([
    {
      type: "list",
      name: "roleDelete",
      message: "Which role would you like to delete?",
      choices: roles.map(({ title, id }) => ({
        name: title,
        value: id,
      })),
    },
  ]);

  const sql = `DELETE FROM roles WHERE id = ?`;

  connection.query(sql, response.roleDelete, (err) => {
    if (err) {
      console.log(`Error in deleting role`);
    } else {
      console.log(`\n Role has been deleted from the database \n `);
    }
    init();
  });
}

//function to delete an employee
async function deleteEmp() {
  const employees = await getEmployees();
  const response = await inquirer.prompt([
    {
      type: "list",
      name: "employeeDelete",
      message: "Which employee would you like to delete?",
      choices: employees.map(({ id, first_name, last_name }) => ({
        name: first_name + " " + last_name,
        value: id,
      })),
    },
  ]);

  const sql = `DELETE FROM employee WHERE id = ?`;

  connection.query(sql, response.employeeDelete, (err) => {
    if (err) {
      console.log(`Error in deleting employee`);
    } else {
      console.log(`\n Employee has been deleted from the database \n `);
    }
    init();
  });
}
