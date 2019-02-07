const User = require('../models/User');
const encryption = require('../utilities/encryption');

module.exports.registerGet = (req, res) => {
    res.render('user/register');
};

module.exports.registerPost = (req, res) => {
    const user = req.body;
    const {username, password, confirmedPassword} = user;

    if (!username || !password || !confirmedPassword) {
        user.error = 'Please Fill All Fields';
        res.render('user/register', user);
        return;
    }

    if (password && (password !== confirmedPassword)) {
        user.error = 'Passwords Should Match';
        res.render('user/register', user);
        return;
    }

    const salt = encryption.generateSalt();
    user.salt = salt;

    if (password) {
        user.password = encryption.generateHashedPassword(salt, password);
        user.originalPassword = password;
    }

    User.create(user)
        .then(user => {
            req.logIn(user, (err, user) => {
                if (err) {
                    res.render('user/register', {
                        error: 'Authentication Is Not Working'
                    });
                    return;
                }

                res.redirect('/');
            });
        })
        .catch(error => {
            user.error = error;
            res.render('user/register', user);
        })
};

module.exports.loginGet = (req, res) => {
    res.render('user/login');
};

module.exports.loginPost = (req, res) => {
    const userToLogin = req.body;
    const {username, password} = userToLogin;

    User.findOne({username})
        .then(user => {
            if (!user || !user.authenticate(password)) {
                userToLogin.error = 'Invalid Credentials';
                res.render('user/login', userToLogin)
            } else {
                req.logIn((user), (error, user) => {
                    if (error) {
                        userToLogin.error = 'Authentication Is Not Working';
                        res.render('user/login', userToLogin);
                        return;
                    }

                    res.redirect('/');
                });
            }
        })
        .catch(error => {
            userToLogin.error = error;
            res.render('user/login', userToLogin);
        })
};

module.exports.logout = (req, res) => {
    req.logout();
    res.redirect('/');
};