const User = require("../models/user.model")
const loginToken = require("../models/loginToken")
const Company = require('../models/company.model')
const Task = require('../models/task.model')
const Attendance = require('../models/attendance.model')
const { passwordCompare, passwwordHash } = require("../helpers/bcrypt")
const {cloudinaryUpload} = require("../helpers/cloudinary")
const { sendMail } = require("../helpers/mailer")
const {randomNumber} = require("../helpers/randomNumGenerator")
const fs = require("fs")
const path = require("path")
const handleBars = require("handlebars")
const employeeModel = require("../models/employee.model")
const leaveModels = require("../models/leave.models")

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
            return response.status(400).json({ message: "Email not recognized" })
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

const companyDetails = async (request, response) => {
    try{
        const userId = request.query.userId
        const isExist = await User.findOne({userId})
        if(!isExist){
            return response.status(400).json({message: "Please sign up"})
        }
        const {companyName, role, numOfEmployees, businessIndustry} = request.body
        if(!companyName && !role && !numOfEmployees && !businessIndustry) {
            return response.status(400).json({ message: "Please fill all fields!"})
        }
        const company = new Company({
            userId: userId,
            companyName: companyName,
            role: role,
            numOfEmployees: numOfEmployees,
            businessIndustry: businessIndustry
        })
        await company.save()
        return response.status(201).json({message: "Details recorded successfully!"})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

const addEmployeee = async(request, response) => {
    try {
        const userId = request.query.userId
        const adminCompany = await Company.findOne({userId})
        const { firstname, lastname, email, department} = request.body
        if(!firstname && !lastname && !email){
            return response.status(400).json({message: "Please fill all required fields"})
        }
        const empExist = await employeeModel.findOne({email})
        if(empExist){
            return response.status(400).json({message: "Employee record already exists"})
        }
        const employee = new employeeModel({
            firstname: firstname,
            lastname: lastname,
            email: email,
            department: department,
            comapnyId: adminCompany._id,
            userId: adminCompany.userId
        })
        await employee.save()
        const url = `http:localhost:5000/employee/loginEmp`
        const filePath = path.join(__dirname, "../empReg.html")
        const source = fs.readFileSync(filePath, "utf-8").toString()
        const template = handleBars.compile(source)
        const replacements = {
            firstname: firstname,
            link: url
        }
        const htmlToSend = template(replacements)
    
        await sendMail(email, "Employee Login", htmlToSend)
        return response.status(201).json({message: "New employee record added succesfully!"})
    }
    catch(err){
        return new response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

const updateEmployee = async (request, response) => {
    try {
        const userId = request.query.userId
        const adminId = request.query.adminId
        const isExist = await employeeModel.findById({_id: userId})
        if(adminId != isExist.userId){
            return response.status(400).json({message: "You cannot update the record of an employee you did not create"})
        }
        if(!isExist){
            return response.status(400).json({message: "Employee does not exists"})
        }
        const updateUser = await employeeModel.findByIdAndUpdate(userId, {$set: request.body}, {new: true})
        return response.status(200).json({message: "Employee recorded successfully", updateUser})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

const deleteEmployee = async (request, response) => {
    try {
        const userId = request.query.userId
        const adminId = request.query.adminId
        const isExist = await employeeModel.findById({_id: userId})
        if(!isExist){
            return response.status(400).json({message: "Employee does not exists"})
        }
        if(adminId != isExist.userId){
            return response.status(400).json({message: "You cannot delete the record of an employee you did not create"})
        }
        await employeeModel.findByIdAndDelete(userId)
        return response.status(200).json({message: "Employee deleted successfully"})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

const getAllEmployee = async (request, response) => {
    try {
        const employee = await employeeModel.find()
        return response.status(200).json({
            message: "Employee record fetched successfully", Employee: employee
        })
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

const getEmployeeBySearch = async (request, response) => {
    try {
        const search = request.query.search
        const emp = await employeeModel.find({firstname: {$regex: search, $options: 'i'}}).limit(10)
        if(!emp){
            return response.status(400).json({message: "Record not found"})
        }
        return response.status(200).json({message: "Records found", Employee: emp})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

const assignTasksToEmployee = async(request, response) => {
    try{
        const userId = request.query.userId
        const {taskName} = request.body
        const isExist = await employeeModel.findById({_id: userId})
        if(!isExist){
            return response.status(400).json({message: "Employee does not exists"})
        }
        const task = new Task({
            empId: userId,
            taskName: taskName,
        })
        await task.save()
        return response.status(201).json({message: "Task assigned to employee successfully", task: task})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

// This tracks the attendance by the filter specified by the admin
// The start date, the end date as well as the attendance status in one query!
const trackAttendancePerDay = async (request, response) => {
    try{
        const startDate = new Date(request.query.startDate);
        const endDate = new Date(request.query.endDate)
        const status = request.query.status
        const empAttendance =  await Attendance.find({createdAt: {$gte: startDate, $lte: endDate}, status: status || {$exists: true}})
        if(empAttendance.length === 0){
            return response.status(200).json({message: "No record"})
        }
        return response.status(200).json({message: "Attendance record for the period specified", empAttendance})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

const approveLeaveRequest = async (request, response) => {
    try{
        const empId = request.query.empId
        const emp = await leaveModels.findOne({empId: empId})
        const count = emp.countOfLeaves
        const update = await emp.updateOne({countOfLeaves: count + 1, status: 'approved'})
        await emp.save()
        return response.status(200).json({message: "Leave approved"})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

const declineLeaveRequest = async (request, response) => {
    try{
        const empId = request.query.empId
        const emp = await leaveModels.findOne({empId: empId})
        const update = await emp.updateOne({status: 'declined'})   
        await emp.save()
        return response.status(200).json({message: "Leave declined"})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

module.exports = {
    register, loginWithVerificationCode,
    verifyLoginToken,requestLoginToken,companyDetails, addEmployeee,
    updateEmployee, deleteEmployee, getAllEmployee, getEmployeeBySearch,
    assignTasksToEmployee, trackAttendancePerDay, approveLeaveRequest,
    declineLeaveRequest
}