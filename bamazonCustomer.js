

var inquirer = require("inquirer");
var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Bubbles.7",
    database: "bamazon_db"
});

var ProductInventory = function() {

    this.getInventory = function(callback) {
        connection.query(
            "SELECT * FROM products",
            function(err, res) {
                var products = [];
                for (var i = 0; i < res.length; i++) {
                    var product = new Product(res[i].item_id, res[i].price, res[i].department_name, res[i].stock_quantity, res[i].product_name);
                    products.push(product);
                };
                callback(products);
            });
    }
    this.getProduct = function(callback, itemId) {
        connection.query(
            "SELECT * FROM products WHERE item_id=?", [itemId],
            function(err, res) {
                var product = new Product(res[0].item_id, res[0].price, res[0].department_name, res[0].stock_quantity, res[0].product_name);
                callback(product);
            }
        );
    }
    this.removeStock = function(product, quantity) {
        connection.query(
            "UPDATE products SET ? WHERE ?", [{
                    stock_quantity: product.stock - quantity
                },
                {
                    item_id: product.itemId
                }
            ],
            function(err, res) {}
        );
    }
}

var Product = function(itemId, price, category, stock, name) {
    this.itemId = itemId;
    this.price = price;
    this.category = category;
    this.stock = stock;
    this.name = name;
    this.buy = function(quantity) {
        var inventory = new ProductInventory();
        inventory.removeStock(this, quantity);
    }
}

var product = null;
var inventory = new ProductInventory();
var quantity = null;

function displayInventory() {
    inventory.getInventory(function(products) {
        for (var i = 0; i < products.length; i++) {
            console.log(products[i].itemId + " | " + products[i].name + " | " + products[i].category + "  | " + products[i].price + " | " + products[i].stock);
        }
        reqeustId();
    });
}

function reqeustId() {
    inquirer.prompt([{
        name: "id",
        type: "input",
        message: "What is the ID of the product you want to order?",
        validate: function(input) {
            if (input === "") {
                console.log("You need to input a product ID");
                return false;
            }
            else if (isNaN(input)){
            	console.log("WHAT ARE YOU DOIN YA TURD?!");
            }
            else {
                return true;
            }
        }

    }]).then(function(answer) {
        inventory.getProduct(function(productResult) {
            product = productResult;
            requestQuantity();
        }, answer.id);
    })
}

function requestQuantity() {
    inquirer.prompt([{
        name: "howMany",
        type: "input",
        message: "How many do you want to buy?",
        validate: function(input) {
            if (input === "") {
                console.log("You need to input an amount.");
                return false;
            } else if (isNaN(input)) {
                console.log("WHAT ARE YOU DOING YA TURD?!")
                return false;
            }
            else if (product.stock < input) {
            	console.log("\nSorry, we don't have enough in stock to fulfill your order!")
            	requestQuantity();
            }
             else {
                return true;
            }
        }
    }]).then(function(answer) {
        quantity = answer.howMany;
        confirm();
    })
}

function confirm() {
    console.log("You owe $" + product.price * quantity);
    inquirer.prompt([{
        name: "sure",
        type: "confirm",
        message: "Are you sure you want to by this item?"
    }]).then(function(answer) {
        if (answer.sure === true) {
            console.log("Your item is on it's way!")
            product.buy(quantity);
        } else {
            console.log("Okay, Here is a list of our products you can choose from instead.")
            displayInventory();
        }
    })
}



displayInventory();