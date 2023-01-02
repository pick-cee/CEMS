const employeeModel = require("../models/employee.model")
const login = require('../models/loginToken')
const {randomNumber} = require('../helpers/randomNumGenerator')
const fs = require("fs")
const path = require("path")
const handleBars = require("handlebars")
const { sendMail } = require("../helpers/mailer")

const loginEmp = async(request, response) => {
    try{
        const {email} = request.body
        const isExist = await employeeModel.findOne({email})
        if(!isExist){ 
            return response.status(400).json({
                message: "Record does not exists"
            })
        }
        if(!email){
            return response.status(400).json({
                message: "Please enter your email"
            })
        }
        const random = await randomNumber()
        const token = new login({
            userId: isExist._id,
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
        await sendMail(email, "Login verification code", htmlToSend)
        return response.status(200).json({
            message: "Please check your email for a code to complete the login process"
        })
    }
    catch(err){
        return response.status(500).json({message: err.message  || "Some error occured, try again later"})
    }
}

const verifyLoginToken = async(request, response) => {
    try{
        const userId = request.query.userId
        const {token} = request.body

        const otp = await login.findOne({userId, token})
        if(otp.expiresIn < new Date().getTime()){
            return response.status(400).json({
                message: "The code has expired, please request another one"
            })
        }
        const newEmp = await employeeModel.findByIdAndUpdate({_id: userId}, {lastLogin: Date.now()})
        await newEmp.save()
        return response.status(200).json({message: "Log in successful!"})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

const resendLoginToken = async(request, response) => {
    try {
        const {email} = request.body
        const isExist = await employeeModel.findOne({email: email})
        if(!isExist) {
            return response.status(400).json({message: "Cannot find email addresss, please sign up"})
        }
        const random = await randomNumber()
        const filePath = path.join(__dirname, "../request.html")
        const source = fs.readFileSync(filePath, "utf-8").toString()
        const template = handleBars.compile(source)
        const replacements = {
            firstname: isExist.firstname,
            code: random
        }
        const htmlToSend = template(replacements)

        await sendMail(email, "Request successful", htmlToSend)
        const token = new login({
            userId: isExist._id,
            code: random
        })
        await token.save()
        return response.status(200).json({message: "Request made successfully, check your mail."})
    }
    catch(err) {
        return response.status(500).json({message: err.message || "Some error occured, try agin later"})
    }
}

module.exports = { loginEmp, verifyLoginToken, resendLoginToken}