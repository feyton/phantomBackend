import { Router } from 'express'
import userRoute from '../userApp/routes.js'
const router = Router()

router.use('/user', userRoute)

export default router
