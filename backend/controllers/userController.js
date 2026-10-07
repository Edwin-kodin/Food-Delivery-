import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findOne({ where: { email } });
        if (!user) {
            return res.json({ success: false, message: "User doesn't exist" })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" })
        }
        const token = createToken(user.id);
        res.json({ success: true, token, user })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// register user
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        const exists = await userModel.findOne({ where: { email } });
        if (exists) {
            return res.json({ success: false, message: "User already exists" })
        }
        if (!email.includes('@')) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await userModel.create({
            name: name,
            email: email,
            password: hashedPassword
        })

        const token = createToken(user.id);
        res.json({ success: true, token, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}

// get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findByPk(req.body.userId, {
            attributes: { exclude: ['password'] }
        });
        res.json({ success: true, user });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching profile" });
    }
}

// update user profile
const updateUserProfile = async (req, res) => {
    try {
        const { name } = req.body;
        await userModel.update({ name }, { where: { id: req.body.userId } });
        res.json({ success: true, message: "Profile updated" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error updating profile" });
    }
}

export { loginUser, registerUser, getUserProfile, updateUserProfile }
