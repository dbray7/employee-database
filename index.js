const { prompt } = require("inquirer");
const logo = require("asciiart-logo");
const db = require("./db");
require("console.table");

init();

// Display logo text, load main prompts
function init() {
  const logoText = logo({ name: "Employee Manager" }).render();

  console.log(logoText);

  loadMainPrompts();
}

async function loadMainPrompts() {
  const { choice } = await prompt([
    {
      type: "list",
      name: "choice",
      message: "What would you like to do?",
      choices: [
        {
          name: "View All Employees",
          value: "VIEW_EMPLOYEES"
        },
        {
          name: "View All Employees By Department",
          value: "VIEW_EMPLOYEES_BY_DEPARTMENT"
        },
        {
          name: "View All Employees By Manager",
          value: "VIEW_EMPLOYEES_BY_MANAGER"
        },
        {
          name: "Add Employee",
          value: "ADD_EMPLOYEE"
        },
        {
          name: "Remove Employee",
          value: "REMOVE_EMPLOYEE"
        },
        {
          name: "Add Department",
          value: "ADD_DEPARTMENT"
        },
        {
          name: "Add Role",
          value: "ADD_ROLE"
        },
        {
          name: "View Roles",
          value: "VIEW_ROLES"
        },
        {
          name: "View Departments",
          value: "VIEW_DEPARTMENTS"
        },
        {
          name: "Update Employee Role",
          value: "UPDATE_EMPLOYEE_ROLE"
        },

        //You will need to complete the rest of the switch statement
        {
          name: "Quit",
          value: "QUIT"
        }
      ]
    }
  ]);

  // Call the appropriate function depending on what the user chose
  switch (choice) {
    case "VIEW_EMPLOYEES":
      return viewEmployees();
    case "VIEW_EMPLOYEES_BY_DEPARTMENT":
      return viewEmployeesByDepartment();
    case "VIEW_EMPLOYEES_BY_MANAGER":
      return viewEmployeesByManager();
    case "ADD_EMPLOYEE":
      return addEmployee();
    case "REMOVE_EMPLOYEE":
      return removeEmployee();
    case "ADD_DEPARTMENT":
      return addDepartment();
    case "ADD_ROLE":
      return addRole();
    case "VIEW_ROLES":
      return viewRoles();
    case "VIEW_DEPARTMENTS":
      return viewDeparments();
    case "UPDATE_EMPLOYEE_ROLE":
      return updateEmployeeRole();

    //You will need to complete the rest of the cases 
    default:
      return quit();
  }
}

async function viewDeparments() {
  const departments = await db.findAllDepartments();

  console.log("\n");
  console.table(departments);

  loadMainPrompts();
}

async function viewRoles() {
  const roles = await db.findAllRoles();

  console.log("\n");
  console.table(roles);

  loadMainPrompts();
}

async function viewEmployees() {
  const employees = await db.findAllEmployees();

  console.log("\n");
  console.table(employees);

  loadMainPrompts();
}

async function viewEmployeesByDepartment() {
  const departments = await db.findAllDepartments();

  const departmentChoices = departments.map(({ id, name }) => ({
    name: name,
    value: id
  }));

  const { departmentId } = await prompt([
    {
      type: "list",
      name: "departmentId",
      message: "Which department would you like to see employees for?",
      choices: departmentChoices
    }
  ]);

  const employees = await db.findAllEmployeesByDepartment(departmentId);

  console.log("\n");
  console.table(employees);

  loadMainPrompts();
}

async function viewEmployeesByManager() {
  const managers = await db.findAllEmployees();

  const managerChoices = managers.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  const { managerId } = await prompt([
    {
      type: "list",
      name: "managerId",
      message: "Which employee do you want to see direct reports for?",
      choices: managerChoices
    }
  ]);

  const employees = await db.findAllEmployeesByManager(managerId);

  console.log("\n");

  if (employees.length === 0) {
    console.log("The selected employee has no direct reports");
  } else {
    console.table(employees);
  }

  loadMainPrompts();
}

async function removeEmployee() {
  const employees = await db.findAllEmployees();

  const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  const { employeeId } = await prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee do you want to remove?",
      choices: employeeChoices
    }
  ]);

  await db.removeEmployee(employeeId);

  console.log("Removed employee from the database");

  loadMainPrompts();
}

async function addEmployee() {
  const roles = await db.findAllRoles();
  const managers = await db.findAllEmployees();
  const managerChoices = managers.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));
  const rolesChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id
  }));
  const employee = await prompt([
    {
      name: "first_name",
      message: "What is the employee's first name?"
    },
    {
      name: "last_name",
      message: "What is the employee's last name?"
    }, {
      type: "list",
      name: "role_id",
      message: "What role would you like the employee to have?",
      choices: rolesChoices
    },
    {
      type: "list",
      name: "manager_id",
      message: "Who is this employees manager?",
      choices: managerChoices
    }
  ]);
  await db.addEmployee(employee.first_name, employee.last_name, employee.role_id, employee.manager_id);
  console.log("added employee to the database");
  loadMainPrompts();
}
async function addDepartment() {
  const department = await prompt([
    {
      name: "name",
      message: "What is the name of the department?"
    }
  ]);
  await db.createDepartment(department);
  console.log("added department to the database");
  loadMainPrompts();
}
async function addRole() {
  const departments = await db.findAllDepartments();

  const departmentChoices = departments.map(({ id, name }) => ({
    name: name,
    value: id
  }));
  const role = await prompt([
    {
      name: "title",
      message: "What is the title of the role?"
    },
    {
      type: "number",
      name: "salary",
      message: "What is the salary for this role?"
    },
    {
      type: "list",
      name: "department_id",
      message: "What department would you like to add this role to?",
      choices: departmentChoices
    }
  ]);

  await db.createRole(role);
  console.log("added this role to the database");
  loadMainPrompts();
}
async function updateEmployeeRole() {
  const roles = await db.findAllRoles();
  const rolesChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id
  }));
  const employees = await db.findAllEmployees();

  const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));
  const newRole = await prompt([
    {
      type: "list",
      name: "employeeId",
      message: "What employees role would you like to change?",
      choices: employeeChoices
    },
    {
      type: "list",
      name: "roleId",
      message: "What is the employees new role?",
      choices: rolesChoices
    }
  ]);
  await db.updateEmployeeRole(newRole.employeeId, newRole.roleId);
  console.log("added employees new role to database");
  loadMainPrompts();
}

function quit() {
  console.log("Goodbye!");
  process.exit();
}
