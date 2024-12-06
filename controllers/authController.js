const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const retRresp = require('../Utils/Response');


// Signup API
exports.signup = async(req, res) => {
    //get data from user
    const {name, email, password} = req.body;
    
    try {
        //check if email already exsits
        const userExists = await User.findOne({ email });
        if(userExists) {
            return retRresp(res, 400, 'User already exists');
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // save user to database
        const user = new User({
            name: name,
            email: email, 
            password: hashedPassword,
        });

        await user.save();

        retRresp(res, 201,'Singup successful!', {
                    id: user._id,
                    name: user.name,
                    email: user.email,
            }
        );

    } catch (err) {
        console.log(err);
        retRresp(res, 500, 'Unable to singup', err.message );
    }
};

//Login API
exports.login = async(req, res) => {
    //get data from user
    const { email, password } = req.body;

    try {
        // get the user using email
        const user = await User.findOne({ email: email });

        if(!user) {
            retRresp(res, 422, 'User not found!');
        }

        // match the password
        const doMatch = await bcrypt.compare(password, user.password);

        // if password match create session to authenticate user login
        if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            await req.session.save((err) => {
                if (err) {
                    retRresp(res, 500, 'Session save error', err.message);

                }
              
                retRresp(res, 200, 'User logged in successfully!', {
                            id: user._id,
                            name: user.name,
                            email: user.email,
                });
        });

        } else {
            return retRresp(res, 422, 'Incorrect password');
        }

    } catch (err) {
         console.log(err);
        retRresp(res, 500, 'Login error', err.message);
    }

};

// Logout API
exports.logout = (req, res) => { 
    try { 
        req.session.destroy((err) => {
            if (err) {
                console.log(err);
                return retRresp(res, 500, 'Error destroying session', err.message);
            }

            retRresp(res, 200, 'User logged out successfully!');    
        }); 
        
    } catch (err) {
        console.log(err);
        retRresp(res, 500, 'Logout error', err.message );
    }

};


