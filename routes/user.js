const router = require("express").Router()
const formidable = require('express-formidable')
const {register, loginWithVerificationCode, 
    verifyLoginToken, requestLoginToken, companyDetails, 
    addEmployeee, updateEmployee, deleteEmployee, getAllEmployee, update,
    getEmployeeBySearch,
    assignTasksToEmployee,
    trackAttendancePerDay,
    approveLeaveRequest,
    declineLeaveRequest, filterAcceptedLeaveRequest, 
    filterDeclinedLeaveRequest, filterPendingLeaveRequest} = require("../controller/user.controller")

router.post('/register', formidable(), register)
router.post('/login', loginWithVerificationCode)
router.put('/update', formidable(), update)
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
router.get('/acceptedLeaveRequest', filterAcceptedLeaveRequest)
router.get('/declinedLeaveRequest', filterDeclinedLeaveRequest)
router.get('/pendingLeaveRequest', filterPendingLeaveRequest)

module.exports = router