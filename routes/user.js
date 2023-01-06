const router = require("express").Router()
const {register, loginWithVerificationCode, 
    verifyLoginToken, requestLoginToken, companyDetails, 
    addEmployeee, updateEmployee, deleteEmployee, getAllEmployee, 
    getEmployeeBySearch,
    assignTasksToEmployee,
    trackAttendancePerDay,
    approveLeaveRequest,
    declineLeaveRequest} = require("../controller/user.controller")

router.post('/register', register)
router.post('/login', loginWithVerificationCode)
router.post('/verifyLogin', verifyLoginToken)
router.post('/requestLoginToken', requestLoginToken)
router.post('/registerCompanyDeets', companyDetails)
router.post('/addEmployee', addEmployeee)
router.put('/updateEmployee', updateEmployee)
router.delete('/deleteEmployee', deleteEmployee)
router.get('/getAllEmployee', getAllEmployee)
router.get('/getEmpBySearch', getEmployeeBySearch)
router.post('/assignTaskToEmployee', assignTasksToEmployee)
router.get('/trackAttendance', trackAttendancePerDay)
router.post('/approveLeave', approveLeaveRequest)
router.post('/declineLeave', declineLeaveRequest)

module.exports = router