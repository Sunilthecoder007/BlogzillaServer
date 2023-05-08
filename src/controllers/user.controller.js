const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  if (req.files && Object.keys(req.files).length > 0) {
    let avatar = req.files.avatar;
    const ext = avatar.name.split('.').filter(Boolean).slice(1);
    const fileName = Date.now() + '.' + ext[0];
    avatar.mv('public/avatars/' + fileName, async (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      req.body.avatar = fileName;
      const user = await userService.updateUserById(req.params.userId, req.body);
      res.send({ data: user, success: true, message: 'Avatar updated successfully!' });
    });
  } else {
    const user = await userService.updateUserById(req.params.userId, req.body);
    res.send({ data: user, success: true, message: 'User Info updated successfully!' });
  }
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
