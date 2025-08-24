import express from 'express'
import { create_book, delete_book, get_books, update_book } from '../controllers/book.controller.js'
import { authenticateToken, verifyPermission } from '../middlewares/authMiddleware.js'
const router = express.Router()

router.route(`/`).post(authenticateToken,create_book).get(get_books)
router.route(`/manage/:bookId`).delete(authenticateToken,verifyPermission("ADMIN",'USER'),delete_book).patch(authenticateToken,verifyPermission("ADMIN","USER"),update_book)
export default router