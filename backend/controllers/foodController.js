import foodModel from "../models/foodModel.js";
import fs from "fs";

// add food item
const addFood = async (req, res) => {
    let image_filename = req.file ? req.file.filename : "";

    try {
        await foodModel.create({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename
        });
        res.json({ success: true, message: "Food Added" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// all food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.findAll();
        res.json({ success: true, data: foods });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

// remove food item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findByPk(req.body.id);
        if (food) {
            if (food.image) {
                fs.unlink(`uploads/${food.image}`, () => {})
            }
            await food.destroy();
        }
        res.json({ success: true, message: "Food Removed" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" });
    }
}

export { addFood, listFood, removeFood }
