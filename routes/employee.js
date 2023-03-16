const router = require("express").Router()
const formidable = require('express-formidable')
const {loginEmp, verifyLoginToken, resendLoginToken, markTaskAsCompleted, 
    markAttendance, requestForLeave, updateDetails,
    createChatRoom, sendChat
} = require('../controller/employee.controller')

router.post('/loginEmployee', loginEmp)
router.post('/verifyEmployeeToken', verifyLoginToken)
router.post('/resendLoginToken', resendLoginToken)
router.put('/updateTaskStatus', markTaskAsCompleted)
router.post('/markAttendance', markAttendance)
router.post('/requestLeave', requestForLeave)
router.put('/updateDetails', formidable(), updateDetails)
router.post('/createChatRoom', createChatRoom)
router.post('/sendChat', sendChat)

module.exports = router