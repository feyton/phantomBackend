import { Router } from 'express'
import { IdRequired } from '../middleware/base.js'
import {
    CreateUser,
    deleteUser,
    GetUsers,
    LoginUser,
    UpdateUser,
} from './views.js'
const router = Router()

router.get('/', GetUsers)
router.post('/', CreateUser)
router.put('/:id', IdRequired, UpdateUser)
router.post('/login', LoginUser)
router.delete('/:id', IdRequired, deleteUser)

export default router
