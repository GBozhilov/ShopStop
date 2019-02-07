const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const encryption = require('../utilities/encryption');
const propIsRequired = '{0} is required.';

const userSchema = new Schema({
    username: {
        type: Schema.Types.String,
        required: propIsRequired.replace('{0}', 'Username'),
        unique: true
    },
    password: {
        type: Schema.Types.String,
        required: propIsRequired.replace('{0}', 'Password'),
    },
    salt: {
        type: Schema.Types.String,
        required: true,
    },
    firstName: {
        type: Schema.Types.String,
        required: propIsRequired.replace('{0}', 'First name'),
    },
    lastName: {
        type: Schema.Types.String,
        required: propIsRequired.replace('{0}', 'Last name'),
    },
    age: {
        type: Schema.Types.Number,
        min: [0, 'Age must be between 0 and 120'],
        max: [120, 'Age must be between 0 and 120']
    },
    gender: {
        type: Schema.Types.String,
        enum: {
            values: ['Male', 'Female'],
            message: 'Gender should be either "Male" or "Female"'
        }
    },
    roles: [{type: Schema.Types.String}],
    boughtProducts: [{type: Schema.Types.ObjectId, ref: 'Product'}],
    createdProducts: [{type: Schema.Types.ObjectId, ref: 'Product'}],
    createdCategories: [{type: Schema.Types.ObjectId, ref: 'Category'}]
});

userSchema.method({
    authenticate: function (password) {
        let hashedPassword = encryption.generateHashedPassword(this.salt, password);
        return hashedPassword === this.password;
    }
});

const User = mongoose.model('User', userSchema);

User.seedAdminUser = async () => {
    try {
        const users = await User.find();

        if (users.length > 0) {
            return;
        }

        const salt = encryption.generateSalt();
        const hashedPass = encryption.generateHashedPassword(salt, '123');

        return User.create({
            username: 'admin',
            firstName: 'Gosho',
            lastName: 'Bozhilov',
            salt,
            password: hashedPass,
            age: 33,
            gender: 'Male',
            roles: ['Admin']
        });
    } catch (err) {
        console.log(err)
    }
};

module.exports = User;
