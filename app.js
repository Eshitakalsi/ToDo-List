//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js")



const app = express();
const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("public"));
//get route that just send the browser the word hello when a user tries to access the home route.

app.get("/", function (req, res) {
    //response from our server is send this message
    const day = date.getDate();

    res.render("list", {
        listTitle: day,
        newListItems: items
    });

});
/*when a post request is triggered on our home route, we'll save the value of newItem in that text box to variable called item and it will redirect to the home route which then gets us to again app.get for our home route */
app.post("/", function (request, response) {

    const item = request.body.newItem;

    if (request.body.list === "Work") {
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
    }

    response.redirect("/");
});

app.get("/work", function (req, res) {
    res.render("list", {
        listTitle: "Work List",
        newListItems: workItems
    });
});

app.post("/work", function (req, res) {
    const
    item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
})

app.listen(3000, function () {
    console.log("Server started on port 3000.");
});
