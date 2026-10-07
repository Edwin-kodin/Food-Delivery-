import sequelize, { connectDB } from "./config/db.js";
import foodModel from "./models/foodModel.js";

const seed = async () => {
    await connectDB();
    await sequelize.sync();
    
    // Check if there are already items
    const count = await foodModel.count();
    if (count === 0) {
        await foodModel.bulkCreate([
            { name: "Greek Salad", description: "Food provides essential nutrients for overall health and well-being", price: 12, category: "Salad", image: "food_1.png" },
            { name: "Veg Vegan", description: "Food provides essential nutrients for overall health and well-being", price: 18, category: "Deserts", image: "food_2.png" },
            { name: "Chicken Rolls", description: "Food provides essential nutrients for overall health and well-being", price: 24, category: "Rolls", image: "food_3.png" },
            { name: "Peri Peri Rolls", description: "Food provides essential nutrients for overall health and well-being", price: 16, category: "Rolls", image: "food_4.png" }
        ]);
        console.log("Database seeded with 4 dummy food items!");
    } else {
        console.log("Database already has items, skipping seed.");
    }
    process.exit();
}
seed();
