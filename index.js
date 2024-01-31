const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const { Model } = require('./Model/Model');

dotenv.config({ path: './config.env' });

const URI = process.env.URI;
const PORT = process.env.PORT;
const SECRET_KEY = process.env.SECRET_KEY;
const statesKey = process.env.STATES_KEY;

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((error) => console.log(error))



// http://localhost:8080/register

app.post('/register', async (req, res) => {

    const data = req.body;
    try {
        const response = await Model.findOne({ email: data.email });
        if (response) {
            return res.status(402).json({ msg: "Email Already exists" });
        }
        else {
            const { fname, lname, email, password } = data;

            bcrypt.hash(password, 10, (error, hashedPassword) => {
                if (hashedPassword) {
                    const newUser = new Model({ fname, lname, email, password: hashedPassword });
                    newUser.save();
                    return res.status(200).json({ msg: "Registered Successfully" });
                }
                else if (error) {
                    console.log(error)
                }
            })
        }
    } catch (error) {
        console.log(error)
    }

});


// http://localhost:8080/login


app.post('/login', async (req, res) => {

    const data = req.body;
    try {
        const response = await Model.findOne({ email: data.email });
        if (response) {

            bcrypt.compare(data.password, response.password, (error, result) => {
                if (result) {
                    const payload = response.fname;
                    const token = jwt.sign({ payload }, SECRET_KEY, { expiresIn: '1hr' });
                    res.status(200).json({ msg: "Login Successfull", token: token });
                }
                else {
                    return res.status(402).json({ msg: "Incorrect password" });
                }
            })
        }
        else {
            return res.status(402).json({ msg: "Email is incorrect" });
        }
    } catch (error) {
        console.log(error)
    }

});


// http://localhost:8080/authenticate

app.post('/authenticate', (req, res) => {
    const tkn = req.body;
    if (tkn) {
        jwt.verify(tkn.token, SECRET_KEY, (err, decodedTkn) => {
            if (err) {
                res.status(401).send("Token is  not valid")
            }
            else if (decodedTkn) {
                res.status(200).json({fname:decodedTkn.payload})
            }
        })
    }

})


// http://localhost:8080/getStates

app.get('/getStates', (req, res) => {
    var config = {
        method: 'get',
        url: 'https://api.countrystatecity.in/v1/countries/IN/states',
        headers: {
            'X-CSCAPI-KEY': statesKey
        }
    };

    axios(config)
        .then(function (response) {
            res.status(200).json(response.data)
        })
        .catch(function (error) {
            console.log(error);
        });
})


app.listen(PORT, () => {
    console.log("Server running on: ", PORT);
})