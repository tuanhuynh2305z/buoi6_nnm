var express = require('express');
var router = express.Router();
let roleController = require('../controllers/roles');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');

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

// Role Routes
router.get('/', async (req, res, next) => {
    try {
        let roles = await roleController.GetAllRole();
        CreateSuccessRes(res, 200, roles);
    } catch (error) {
        next(error);
    }
});

router.post('/', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        let newRole = await roleController.CreateRole(req.body.name);
        CreateSuccessRes(res, 200, newRole);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        let updatedRole = await roleController.UpdateRole(req.params.id, req.body);
        CreateSuccessRes(res, 200, updatedRole);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', authenticate, authorize(['admin']), async (req, res, next) => {
    try {
        await roleController.DeleteRole(req.params.id);
        CreateSuccessRes(res, 200, { message: 'Role deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
