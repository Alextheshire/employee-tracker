const cTable = require('console.table');
const inquirer = require('inquirer');
const mysql = require('mysql2');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'MercuryinsuperNova2021',
        database: 'employee_db'
    },
    console.log("Connected to employee_db")
);

const departments = [];
const roles = [];
const employees = [];
const populateDepartments = () => {db.query('SELECT name FROM department', (err,results)=> {
    if(err){
        throw err
    }else {
        departments.length = 0
        for (const dep of results) {
            departments.push(dep.name)
        }

    }
})
}
const populateRoles = () => {db.query('SELECT title FROM role', (err,results)=> {
    if(err){
        throw err
    }else {
        roles.length = 0
        for (const role of results) {
            roles.push(role.name)
        }

    }
})
}

populateDepartments();
populateRoles()


const mainMenu = ()=> inquirer.prompt([
    {
        type: "list",
        name: "choice",
        choices: ['View All Employees','']
    }
])