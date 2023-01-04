const router = require("express").Router()
const {loginEmp, verifyLoginToken, resendLoginToken, markTaskAsCompleted} = require('../controller/employee.controller')

router.post('/loginEmployee', loginEmp)
router.post('/verifyEmployeeToken', verifyLoginToken)
router.post('/resendLoginToken', resendLoginToken)
router.put('/updateTaskStatus', markTaskAsCompleted)

module.exports = router