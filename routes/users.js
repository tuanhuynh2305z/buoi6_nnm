var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');

function authenticate(req, res, next) {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'Bạn chưa đăng nhập' });
    }
    const token = req.headers.authorization.split(' ')[1];
    try {
        req.user = jwt.verify(token, constants.SECRET_KEY);
        next();
    } catch (err) {
        res.status(401).send({ message: 'Token không hợp lệ' });
    }
}

function authorize(roles = []) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send({ message: 'Bạn không có quyền truy cập' });
        }
        next();
    };
}

// User Routes
router.get('/', authenticate, authorize(['mod']), async (req, res, next) => {
    try {
        let users = await userController.GetAllUser();
        CreateSuccessRes(res, 200, users);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', authenticate, authorize(['mod']), async (req, res, next) => {
    try {
        let user = await userController.GetUserById(req.params.id);
        CreateSuccessRes(res, 200, user);
    } catch (error) {
        CreateErrorRes(res, 404, error);
    }
});

router.post('/', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        let body = req.body;
        let newUser = await userController.CreateAnUser(body.username, body.password, body.email, body.role);
        CreateSuccessRes(res, 200, newUser);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        let updateUser = await userController.UpdateUser(req.params.id, req.body);
        CreateSuccessRes(res, 200, updateUser);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await userController.DeleteUser(req.params.id);
        CreateSuccessRes(res, 200, { message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
