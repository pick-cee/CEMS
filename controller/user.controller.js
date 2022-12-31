const User = require("../models/user.model")
const loginToken = require("../models/loginToken")
const { passwordCompare, passwwordHash } = require("../helpers/bcrypt")
const { sendMail } = require("../helpers/mailer")
const {randomNumber} = require("../helpers/randomNumGenerator")
const fs = require("fs")
const path = require("path")
const handleBars = require("handlebars")

const register = async(request, response) => {
    try{
        const {firstname, lastname, businessEmail, password} = request.body
        const isExist = await User.findOne({businessEmail})
        if(isExist){
            return response.status(400).json({ message: "Account already exists, please log in."})
        }
        if(!firstname && !lastname && !businessEmail &&!password){
            return response.status(400).json({ message: "All fields are required"})
        }
        const hashedPassword = await passwwordHash(password)
        const user = new User({
            firstname: firstname,
            lastname: lastname,
            businessEmail: businessEmail,
            password: hashedPassword,
        })
    
        const filePath = path.join(__dirname, "../signup.html")
        const source = fs.readFileSync(filePath, "utf-8").toString()
        const template = handleBars.compile(source)
        const replacements = {
            firstname: firstname
        }
        const htmlToSend = template(replacements)
        await sendMail(businessEmail, "Registration Successful", htmlToSend)

        await user.save()
        
        return response.status(201).json({ message: "User created successfully", User: user})
    }
    catch(err){
        return response.status(500).json({ message: err.message || "Something wert wrong, try again later!"})
    }
}

const loginWithVerificationCode = async(request, response) => {
    try{ 
        const {businessEmail} = request.body
        const isExists = await User.findOne({businessEmail})
        if(!isExists){
            return response.status(400).json({ message: "You must be registered first."})
        }
        if(!businessEmail){
            return response.status(400).json({ message: "Fill all fields"})
        }

        const random = await randomNumber()
        const token = new loginToken({
            userId: isExists._id,
            code: random
        })
        const filePath = path.join(__dirname, "../login.html")
        const source = fs.readFileSync(filePath, "utf-8").toString()
        const template = handleBars.compile(source)
        const replacements = {
            code: random
        }
        const htmlToSend = template(replacements)
        
        await token.save()
        await sendMail(businessEmail, "Login verification code", htmlToSend)
        return response.status(200).json({
            message: "Please check your email for a code to complete the login process"
        })
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later."})
    }
}

const verifyLoginToken = async(request, response) => {
    try{
        const userId = request.query.userId;
        const {token} = request.body
        const otp = await loginToken.findOne({userId, token})

        if(otp.expiresIn < new Date().getTime()){
            return response.status(400).json({
                message: "The code has expired, please request another one"
            })
        }
        return response.status(200).json({message: "Log in successful!"})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})

    }
}

const requestLoginToken = async(request, response) => {
    try {
        const {businessEmail} = request.body
        const isExists = await User.findOne({businessEmail})
        if(!isExists){
            return response.status(400).json({ message: "Email not recognized"})
        }
        const random = await randomNumber()
        const filePath = path.join(__dirname, "../request.html")
        const source = fs.readFileSync(filePath, "utf-8").toString()
        const template = handleBars.compile(source)
        const replacements = {
            firstname: isExists.firstname,
            code: random
        }
        const htmlToSend = template(replacements)

        await sendMail(businessEmail, "Request successful", htmlToSend)
        const token = new loginToken({
            userId: isExists._id,
            code: random
        })
        await token.save()
        return response.status(200).json({message: "Request made successfully, check your mail."})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

module.exports = {
    register, loginWithVerificationCode,
    verifyLoginToken,requestLoginToken
}