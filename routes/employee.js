const router = require("express").Router()
const {loginEmp, verifyLoginToken, resendLoginToken, markTaskAsCompleted, markAttendance} = require('../controller/employee.controller')

router.post('/loginEmployee', loginEmp)
router.post('/verifyEmployeeToken', verifyLoginToken)
router.post('/resendLoginToken', resendLoginToken)
router.put('/updateTaskStatus', markTaskAsCompleted)
router.post('/markAttendance', markAttendance)

module.exports = router