class Employee {
  constructor(firstName, lastName, role, manager) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.role = role;
    this.manager = manager;
  }

  getFirstName() {
    return this.firstName;
  }

  getLastName() {
    return this.lastName;
  }

  getRole() {
    return this.role;
  }

  getManager() {
    return this.manager;
  }
}

module.exports = Employee;
