const router = require("express").Router()
const formidable = require('express-formidable')
const {loginEmp, verifyLoginToken, resendLoginToken, markTaskAsCompleted, 
    markAttendance, requestForLeave, updateDetails,
    createChatRoom, sendChat, addUsersToRoom, joinChatRoom
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
router.put('/addToRoom', addUsersToRoom)
router.get('/joinChatRoom', joinChatRoom)

module.exports = router