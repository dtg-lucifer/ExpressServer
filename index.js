const express = require("express");
const app = express();
const port = 8000;
const ipAddress = "http://localhost:8000/";
const stars = require("./stars.json");
const fs = require("fs");
const { fail } = require("assert");
const { json } = require("express");

// middleware
app.use(express.json());

// get all stars in our database
app.get("/", (req, res) => {
    const stars_ = stars.map((star) => {
        delete star.email;
        delete star.code;
        return star;
    });
    res.status(200).json({
        message: "Here are the stars",
        data: stars_,
    });
});

// get a star by email and code
app.get("/my_stars", (req, res) => {
    const { email, code } = req.body;
    const star = stars.filter((star) => {
        return star.email === email && star.code === code;
    });
    if (!star) {
        return res.status(404).json({
            message: "Stars not found",
            status: "fail",
        });
    }
    res.status(200).json({
        status: "success",
        message: `Here is your ${star.length} star(s)`,
        data: star,
    });
});

// add a new star to our database
app.post("/", (req, res) => {
    const { name, email, code, person } = req.body;
    if (!name || !email || !code || !person) {
        return res.status(400).json({
            status: "fail",
            message: "Please fill out all fields",
        });
    }
    // checks if the star name already exists
    const starExists = stars.find((star) => star.name === name);

    if (starExists) {
        return res.status(405).json({
            status: "fail",
            message: "Star name already exists, Please choose a different name",
        });
    }
    const newStar = {
        name,
        email,
        code,
        person,
    };
    stars.push(newStar);
    fs.writeFile("./stars.json", JSON.stringify(stars), (err) => {
        if (err) {
            res.status(500).json({
                message: "Something went wrong",
            });
        }
    });
    res.status(201).json({
        message: "Star added successfully",
        data: newStar,
    });
});

// update a star in our database
app.put("/:name", (req, res) => {
    const { name } = req.params;
    const starExists = stars.find((star) => star.name === name);
    if (!starExists) {
        return res.status(404).json({
            status: "fail",
            message: "Star does not exists..!",
        });
    }
    const { newName, email, code } = req.body;
    if (starExists.email !== email || starExists.code !== code) {
        return res.status(401).json({
            message: "You are not athorized to update the star name",
        });
    }
    starExists.name = newName;
    fs.writeFile("./stars.json", JSON.stringify(stars), (err) => {
        if (err) {
            res.status(500).json({
                message: "Internal Server Error",
            });
        }
    });
    res.status(200).json({
        data: stars,
        message: "Star updated successfully",
    });
});

// delete a star in database
app.delete("/:name", (req, res) => {
    const { name } = req.params;
    const starExists = stars.find((star) => star.name === name);

    if (!starExists) {
        return res.status(400).json({
            message: "Star does not exists",
            status: "fail",
        });
    }

    const { email, code } = req.body;
    if (starExists.email !== email || starExists.code !== code) {
        return res.status(401).json({
            status: "fail",
            message: "You are not athorized to delete this star",
        });
    }

    const index = stars.indexOf(starExists);
    stars.splice(index, 1);
    fs.writeFile("./stars.json", JSON.stringify(stars), (err) => {
        if (err) {
            res.status(500).json({
                message: "Internal server error",
            });
        }
    });

    res.status(200).json({
      message: "Successfully deleted the star"
    })
});

app.listen(port, () => {
    console.log("Server listening at " + ipAddress);
});
