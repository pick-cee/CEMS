const router = require("express").Router()
const {loginEmp, verifyLoginToken, resendLoginToken} = require('../controller/employee.controller')

router.post('/loginEmployee', loginEmp)
router.post('/verifyEmployeeToken', verifyLoginToken)
router.post('/resendLoginToken', resendLoginToken)

module.exports = router