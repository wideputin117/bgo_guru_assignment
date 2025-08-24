import express from 'express'
import { login, signup_controller  } from '../controllers/authController.js'
 const router = express.Router()

router.route(`/signup`).post(signup_controller)
router.route(`/login`).post(login)
 
export default router;