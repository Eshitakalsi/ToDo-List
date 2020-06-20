//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
//STEP 1
const mongoose = require('mongoose');
const date = require(__dirname + "/date.js")



const app = express();
//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
//get route that just send the browser the word hello when a user tries to access the home route.


//create new db STEP2
mongoose.connect("mongodb+srv://admin-eshita:test123@cluster0-rn1oq.mongodb.net/todolistDB", { useNewUrlParser: true , useUnifiedTopology: true });


//STEP 3 
const itemSchema = new mongoose.Schema({
    name: String
});

//STEP 4
const Item = mongoose.model("Item", itemSchema)

//STEP4
const item1 = new Item({
    name: "Welcome to your todolist!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item."
});

const item3 = new Item({
    name: "<--- Hit this to delete an item."
});


const defaultItems = [item1, item2, item3]

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);





app.get("/", function (req, res) {
    //response from our server is send this message

    //STEP 6
    Item.find({}, function (err, results) {
        if (err) {
            console.log(err);
        } else {
            if (results.length === 0) {
                //STEP5
                Item.insertMany(defaultItems, function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Successfully saved items to DB.");
                    }
                });

            } else {
                res.render("list", {
                    listTitle: "Today",
                    newListItems: results
                });
            }

        }
    });



});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);
    List.findOne({
        name: customListName
    }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                });
                list.save();
                res.redirect("/" + customListName);
            } else {
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }

    });




});

/*when a post request is triggered on our home route, we'll save the value of newItem in that text box to variable called item and it will redirect to the home route which then gets us to again app.get for our home route */
app.post("/", function (request, response) {
    const day = date.getDate();
    const itemName = request.body.newItem;
    const listName = request.body.list;

    const item = new Item({
        name: itemName
    });


    if (listName === "Today") {
        item.save();
        response.redirect("/");
    } else {
        List.findOne({
            name: listName
        }, function (err, foundList) {
            if (!err) {
                foundList.items.push(item);
                foundList.save();
                response.redirect("/" + listName);
            }

        });
    }

    //    if (request.body.list === "Work") {
    //        workItems.push(item);
    //        res.redirect("/work");
    //    } else {
    //        items.push(item);
    //    }
    //

});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (err) {
                console.log(err)
            } else {
                console.log("Successfully deleted");
                res.redirect("/");
            }
        });
    } else {
        //first parameter->which list you want to find , second what updates we want to make and third a callback function
        List.findOneAndUpdate({
            name: listName
        }, {
            $pull: {
                items: {
                    _id: checkedItemId
                }
            }
        }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listName)
            }
        })









    }


});
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function () {
    console.log("Server started on port 3000.");
});
