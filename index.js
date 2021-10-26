const cTable = require('console.table');
const inquirer = require('inquirer');
const mysql = require('mysql2');
require('dotenv').config()

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    },
    console.log("Connected to employee_db")
);

const departments = [];
const roles = [];
const employees = ["None"];
const populateDepartments = () => {
    db.query('SELECT name FROM department', (err, results) => {
        if (err) {
            throw err
        } else {
            departments.length = 0
            for (const dep of results) {
                departments.push(dep.name)
            }

        }
    })
}
const populateRoles = () => {
    db.query('SELECT title FROM role', (err, results) => {
        if (err) {
            throw err
        } else {
            roles.length = 0
            for (const role of results) {
                roles.push(role.title)
            }

        }
    })
}
const populateEmployees = () => {
    db.query(`SELECT CONCAT(first_name, " ",last_name) AS full_name
    FROM employee`, (err, results) => {
        if (err) {
            throw err
        } else {
            employees.length = 1
            for (const emp of results) {
                employees.push(emp.full_name)
            }
        }
    })

}

populateDepartments();
populateRoles();
populateEmployees();



const mainMenu = () => inquirer.prompt([
    {
        type: "list",
        name: "choice",
        message: "What would you like to do?",
        choices: ['View All Employees', 'View All Departments', 'View All Roles', 'Add a Department', 'Add a Role', 'Add an Employee', 'Update an Employee Role', 'Quit']
    }
]).then((data) => {
    switch (data.choice) {
        case 'View All Employees':
            viewEmployees()
            break;
        case 'View All Departments':
            viewDepartments()
            break;
        case 'View All Roles':
            viewRoles()
            break;
        case 'Add a Department':
            addDepartment()
            break;
        case 'Add a Role':
            addRole()
            break;
        case 'Add an Employee':
            addEmployee()
            break;
        case 'Update an Employee Role':
            updateRole()

            break;
        case 'Quit': console.log('Goodbye')
            db.end()

            break;
    }
})

const viewEmployees = () => {
    db.query(`SELECT A.id, A.first_name, A.last_name, title, CONCAT(B.first_name, " ",B.last_name) AS Manager
    FROM employee A
    LEFT JOIN employee B ON B.id = A.manager_id
    LEFT JOIN role on A.role_id = role.id`, (err, results) => {
        if (err) {
            throw err
        } else {
            console.table(results)
        }
        mainMenu()
    })
}

const viewDepartments = () => {
    db.query('SELECT * FROM department', (err, results) => {
        if (err) {
            throw err
        } else {
            console.table(results)
        }
        mainMenu()
    })
}

const viewRoles = () => {
    db.query('SELECT role.id,title,salary,department.name AS department FROM role JOIN department ON department_id=department.id ORDER BY role.id', (err, results) => {
        if (err) {
            throw err
        } else {
            console.table(results)
        }
        mainMenu()
    })
}

const addRole = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "title",
            message: "What is the title of the new role?"
        },
        {
            type: "input",
            name: "salary",
            message: "What is the salary of the new role?"
        },
        {
            type: "list",
            name: "department",
            message: "What department does the new role fall under?",
            choices: departments
        }

    ]).then((data) => {
        db.query("SELECT id FROM department where name=?", data.department, (err, results) => {
            if (err) {
                throw err
            } else {
                db.query(`INSERT INTO role (title,salary,department_id) VALUES (?,?,?)`, [data.title, parseFloat(data.salary), results[0].id], (err, res) => {
                    if (err) {
                        throw err
                    }
                    else {
                        console.log("Role Added!")
                        populateRoles()
                        viewRoles()
                    }
                })

            }
        })

    }
    )
}

const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the department name?"
        }
    ]).then((data) => {
        db.query("INSERT INTO department (name) VALUES (?)", data.name, (err, res) => {
            if (err) {
                throw err
            } else {
                console.log("Department Added!")
                populateDepartments()
                viewDepartments()
            }
        })
    })
}

const addEmployee = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "firstName",
            message: "What is the employee's first name?"
        },
        {
            type: "input",
            name: "lastName",
            message: "What is the employee's last name?"
        },
        {
            type: "list",
            name: "role",
            message: "What is the employee's role?",
            choices: roles
        },
        {
            type: "list",
            name: "manager",
            message: "Who is the employee's manager?",
            choices: employees
        }

    ]).then((data) => {
        const firstName = data.firstName;
        const lastName = data.lastName;
        var role
        var manager
        db.query("SELECT id FROM role WHERE title = ?", data.role, (err, res) => {
            if (err) {
                throw err
            } else {
                role = res[0].id
                if(data.manager== "None") {
                    db.query("INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,null)", [firstName, lastName, role], (err, res) => {
                        if (err) {
                            throw err
                        } else {
                            console.log("Employee Added!")
                            populateEmployees()
                            viewEmployees()
                        }
                    }
                    )
                }else {
                db.query("SELECT id FROM employee WHERE CONCAT(first_name, ' ',last_name)=?", data.manager, (err, res) => {
                    if (err) {
                        throw err
                    } else {
                        manager = res[0].id
                        db.query("INSERT INTO employee (first_name,last_name,role_id,manager_id) VALUES (?,?,?,?)", [firstName, lastName, role, manager], (err, res) => {
                            if (err) {
                                throw err
                            } else {
                                console.log("Employee Added!")
                                populateEmployees()
                                viewEmployees()
                            }
                        }
                        )
                    }
                })
            }
            }
        })
    })
}

const updateRole = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'employee',
            message: "Which employee's role do you need to change?",
            choices:employees.slice(1)
        },
        {
            type: 'list',
            name:'role',
            message:'What is their new role?',
            choices: roles
        }
    ]).then((data) => {
        db.query("SELECT id FROM role WHERE title=?",data.role,(err,res) => {
           if(err) {
               throw err
           } else {
            db.query("UPDATE employee SET role_id = ? WHERE CONCAT(first_name, ' ',last_name) = ?",[res[0].id,data.employee],(err,res)=> {
                if(err) {
                    throw err
                } else {
                    console.log("Employee Updated!")
                    mainMenu()
                }
            })
           }
        })
        
    })
}


mainMenu()