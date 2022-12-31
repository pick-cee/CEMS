const router = require("express").Router()
const { request } = require("express")
const {register, loginWithVerificationCode, 
    verifyLoginToken, requestLoginToken} = require("../controller/user.controller")

router.post('/register', register)
router.post('/login', loginWithVerificationCode)
router.post('/verifyLogin', verifyLoginToken)
router.post('/requestLoginToken', requestLoginToken)

module.exports = router