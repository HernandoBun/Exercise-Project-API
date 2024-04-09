const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');


/**
 * Get list of users
 * @returns {Array}
 */
async function getUsers() {
  const users = await usersRepository.getUsers();

  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  }

  return results;
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository. getUsers(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

// In user-service.js


async function isEmailTaken(email) {
  return await usersRepository.isEmailTaken(email);
}
async function changePassword(userId, oldPassword, newPassword, newPasswordConfirm) {
  const user = await usersRepository.getUser(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const PasswordMatched = await passwordMatched(oldPassword, user.password);
  if (!PasswordMatched) {
    throw new Error('Invalid old password');
  }

  if (newPassword !== newPasswordConfirm) {
    throw new Error('New password and confirmation do not match');
  }

  if (newPassword.length < 6 || newPassword.length > 32) {
    throw new Error('New password length must be between 6 and 32 characters');
  }

  const hashedNewPassword = await hashPassword(newPassword);
  await usersRepository.updatePassword(userId, hashedNewPassword);
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  isEmailTaken,
  changePassword,
};

