const express = require("express");
const app = express();
const session = require("express-session");
app.use(
  session({
    secret: "keyboardkitteh",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
  })
);
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/quoting_dojo", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const flash = require("express-flash");
app.use(flash());
const QuoteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: [2, "Name has a minimum length of 2 characters"]
    },
    quote: {
      type: String,
      required: [true, "Quote is required"],
      minlength: [2, "Quote has a minimum length of 2 characters"]
      // message: "Quote is required and has a minimum length of 2 characters"
    }
  },
  { timestamps: true }
);
// create an object that contains methods for mongoose to interface with MongoDB
const Quote = mongoose.model("Quote", QuoteSchema);
var moment = require("moment");
app.use(express.static(__dirname + "/static"));
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.urlencoded({ extended: true }));
app.listen(8000, () => console.log("listening on port 8000"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/quotes", (req, res) => {
  const quote = new Quote(req.body);
  quote
    .save()
    .then(() => res.redirect("/quotes"))
    .catch(err => {
      console.log("We have an error!", err);
      // adjust the code below as needed to create a flash message with the tag and content you would like
      for (var key in err.errors) {
        req.flash("new_quote", err.errors[key].message);
      }
      res.redirect("/");
    });
});

app.get("/quotes", (req, res) => {
  Quote.find()
    .sort({ createdAt: "desc" })
    .then(quotes => {
      // logic with users results
      console.log(quotes);
      res.render("quotes", { quotes: quotes, moment: moment });
    })
    .catch(err => res.json(err));
});
