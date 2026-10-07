import React, { useContext } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../Fooditem/FoodItem";

const FoodDisplay = ({ category }) => {
  const { food_list, foodsLoading, foodsError } = useContext(StoreContext);

  if (foodsLoading) {
    return (
      <div className="food-display" id="food-display">
        <h2>Top dishes near you</h2>
        <p className="food-display-status">Loading menu…</p>
      </div>
    );
  }

  if (foodsError) {
    return (
      <div className="food-display" id="food-display">
        <h2>Top dishes near you</h2>
        <p className="food-display-status food-display-error">{foodsError}</p>
        <p className="food-display-hint">
          Make sure your Node.js backend is running (<code>npm run server</code>) and that you've restarted the frontend (<code>npm run dev</code>).
        </p>
      </div>
    );
  }

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {food_list.map((item) => {
          if (category !== "All" && category !== item.category) return null;
          return (
            <FoodItem
              key={item.id}
              id={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FoodDisplay;
