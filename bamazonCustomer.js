var inquirer = require("inquirer");
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Bubbles.7",
    database: "bamazon_db"
});
var itemId = "";
var stock = "";
var howMany = "";
var price = "";

connection.connect(function(error) {
    if (error) throw error;

    console.log("connect as id " + connection.threadId);

    printProducts();
});

function printProducts() {
    connection.query(
        "SELECT * FROM products",
        function(err, res) {
            for (var i = 0; i < res.length; i++) {
                console.log(res[i].product_name + " | " + res[i].department_name + "  | " + res[i].price + " | " + res[i].stock_quantity);
            }
            console.log("----------------------");
            productId();
        });
};

function productId() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "What is the ID of the product you're looking for?",
        validate: function(input) {
            if (input === "") {
                console.log("You need to input a product ID");
                return false;
            } else {
                return true;
            }
        }
    }]).then(function(answer) {
    	price = answer.price;
        itemId = answer.id;
        inquirer.prompt([{
            name: "howMany",
            type: "input",
            message: "How many do you want to buy?",
            validate: function(input) {
                if (input === "") {
                    console.log("You need to input an amount.");
                    return false;
                } else {
                    return true;
                }
            }


        }]).then(function(answer) {
            console.log("You owe $ " + howMany * price);
            connection.query(
                "SELECT * FROM products WHERE item_id=?", [itemId],
                function(err, res) {
                    stock = res[0].stock_quantity;
                    if (stock >= answer.howMany) {
                        howMany = answer.howMany;
                        inquirer.prompt([{
                            name: "sure",
                            type: "confirm",
                            message: "Are you sure you want to by this item?"
                        }]).then(function(answer) {
                            if (answer.sure === true) {
                                connection.query(
                                    "UPDATE products SET ? WHERE ?", [{
                                            stock_quantity: stock - howMany
                                        },
                                        {
                                            item_id: itemId
                                        }
                                    ],
                                    function(err, res) {
                                        console.log(res.affectedRows + " updated!");
                                    });
                            } else {
                                console.log("Okay, Here's our inventory\n" + printProducts());
                            }

                        });
                    } else {
                        console.log("Not enough in stock!");
                    }
                })

        });
    })
};