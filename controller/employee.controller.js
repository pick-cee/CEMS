const employeeModel = require("../models/employee.model")
const login = require('../models/loginToken')
const Attendance = require('../models/attendance.model')
const Leave = require('../models/leave.models')
const Timesheet = require('../models/timesheet.model')
const Message = require('../models/message')
const chatRoom = require('../models/chatRoom')
const {cloudinaryUpload} = require('../helpers/cloudinary')
const {randomNumber} = require('../helpers/randomNumGenerator')
const fs = require("fs")
const path = require("path")
const handleBars = require("handlebars")
const { sendMail } = require("../helpers/mailer")
const taskModel = require("../models/task.model")



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

const updateDetails = async (request, response) => {
    try {
        const {firstname, lastname} = request.fields
        const {profilePhoto} = request.files
        const empId = request.query.empId
        const empExists = await employeeModel.findById({_id: empId})
        if(!empExists){
            return response.status(400).json({message: "Employee record does not exists"})
        }

        let updateFields = {}
        if(firstname) updateFields.firstname = firstname
        if (lastname) updateFields.lastname = lastname

        if(profilePhoto){
            await cloudinaryUpload(profilePhoto.path)
            .then((downloadURL)=>{
                updateFields.profilePhoto = downloadURL
            })
            .catch((err) => {
                return response.status(400).json({ message: `Cloudinary error: ${err.message}`})
            })
        }
        const employee = await empExists.update(updateFields, {new: true})
        return response.status(200).json({ message: "Employee records updated successfully"})
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
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

const markTaskAsCompleted = async(request, response) => {
    try{
        const empId = request.query.empId
        const emp = await taskModel.findOneAndUpdate({empId: empId}, {status: 'complete'}, {$set: true})
        await emp.save()
        return response.status(200).json({message: "Task updated successfully"})
    }
    catch(err){
        return response.status(500).json({message: err.message || 'Some error occured, try again later'})
    }
}

const markAttendance = async(request, response) => {
    try {
        const userId = request.query.userId
        const isExist = await employeeModel.findOne({_id: userId})
        if(!isExist){
            return response.status(400).json({message: "You need to be registered by the admin"})
        }
        const currentDate = new Date()
        
        Attendance.findOne({ empId: isExist._id, attendanceTime: { $gte: new Date(currentDate.getFullYear(), 
            currentDate.getMonth(), currentDate.getDate()), 
            $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1) }})
            .exec(async (err, attendance) => {
            if(err) {
                return response.status(400).json({message: err.message || "Some error occured!"})
            }
            if(attendance){
                return response.status(400).json({message: "Attendance has been already marked for the day"})
            }
            else {
                const newAttendance = new Attendance({
                    empId: isExist._id,
                    firstname: isExist.firstname,
                    lastname: isExist.lastname,
                    attendanceTime: currentDate.toDateString()
                })

                // Check if the current time is after 10am
                const lateTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 10, 0, 0);
                if(currentDate > lateTime){
                    newAttendance.status = "late"
                }
                //check if the current time is after 11am, the employee is marked absent
                const latestTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 11, 0, 0);
                if(currentDate > latestTime){
                    newAttendance.status = "absent"
                }
                await newAttendance.save()
                return response.status(200).json({message: "Attendance recorded successfully!"})
            }
        })
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

const requestForLeave = async (request, response) => {
    try {
        const userId = request.query.userId
        const {purpose, lengthOfLeave} = request.body
        const emp = await employeeModel.findOne({_id: userId})
        if(!emp){
            return response.status(400).json({message: "You need to be registered first"})
        }
        const leave = new Leave({
            empId: userId,
            purpose: purpose,
            lengthOfLeave: lengthOfLeave
        })
        await leave.save()
        return response.status(200).json({message: "Leave request successful! You will be notified accordingly", leave})
    }
    catch(err){
        return response.status(500).json({message: err.message || 'Some error occured'})
    }
}

const createTimesheet = async (request, response) => {
    try {
        const empId = request.query.empId
        const employeeExists = await employeeModel.findOne({empId})
        if(!employeeExists){
            return response.status(400).json({message: "User does not exists"})
        }

        const timesheet = new Timesheet({
            emp
        })
    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured!"})
    }
}

const createChatRoom = async (request, response) => {
    try {
        // this is the person that is logged in and trying to create a chat room
        const userId = request.query.userId
        const {participants} = request.body
        const userExists = await employeeModel.findById({_id: userId})
        if(!userExists){
            return response.status(400).json({ message: "You have to be registered to be able to chat" })
        }
        // an array of all participants object with their Id and the name of each participant
        const participantObjs = []
        participantObjs.push({participantId: userId, participantName: userExists.firstname + " " +userExists.lastname})
        console.log(participantObjs)
        for (let i=0; i<participants.length; i++){
            const participantId = participants[i]
            const participant = await employeeModel.findById({_id: participantId})
            if(!participant){
                return response.status(400).json({ message: `User with ID ${participantId} not found` })
            }
            participantObjs.push({participantId, participantName: participant.firstname + " " +participant.lastname})
        }
        const room = new chatRoom({
            participants: participantObjs
        })
        await room.save()

        return response.status(201).json({message: "Chat room created successfully"})
    } 
    catch(err) {
        return response.status(500).json({ message: err.message || "Some error occured!"})
    }
}

const sendChat = async (request, response) => {
    try{
        const userId = request.query.userId
        const chatRoomId = request.query.chatRoomId
        const {message} = request.body
        const userExists = await employeeModel.findById({ _id: userId })
        const roomExists = await chatRoom.findById({ _id: chatRoomId })
        if(!userExists){
            return response.status(400).json({ message: "You have to be registered to be able to chat" })
        }
        if(!roomExists) {
            return response.status(400).json({ message: "Chat room does not exists"})
        }

        const chat = new Message({
            sender: userId,
            senderFullname: userExists.firstname + " " +userExists.lastname,
            content: message,
            chatRoomId: chatRoomId
        })

        await chat.save()
        
        return response.status(201).json({message: "Chat sent"})
    }
    catch(err){
        return response.status(500).json({ message: err.message || "Some error occured!"})
    }
}

const joinChatRoom = async (request, response) => {
    try{

    }
    catch(err){
        return response.status(500).json({message: err.message || "Some error occured, try again later"})
    }
}

module.exports = { 
    loginEmp, verifyLoginToken, resendLoginToken,
    markTaskAsCompleted, markAttendance, requestForLeave, createTimesheet, updateDetails,
    createChatRoom, sendChat
}