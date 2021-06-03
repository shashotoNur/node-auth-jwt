const { Router } = require('express');
const authController = require('../controllers/authController');

const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);

router.get('/login', authController.login_get);
router.post('/login', authController.login_post);

router.get('/logout', authController.logout_get);

router.post('/delete', authController.delete_post);
router.get('/delete', authController.delete_get);

router.post('/update-password', authController.updatePassword_post);
router.get('/update-password', authController.updatePassword_get);

module.exports = router;