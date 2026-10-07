import React, { useContext, useEffect, useState } from "react";
import "./MyOrders.css";
import { StoreContext } from "../../context/StoreContext";
import { apiFetch, getStoredToken } from "../../api/client";
import { assets } from "../../assets/assets";

const MyOrders = () => {
    const { getCartItemCount } = useContext(StoreContext);
    const [data, setData] = useState([]);

    const fetchOrders = async () => {
        try {
            const token = getStoredToken();
            if (token) {
                const response = await apiFetch("/order/userorders", {
                    method: "POST",
                    token
                });
                setData(response.data);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="my-orders">
            <h2>My Orders</h2>
            <div className="container">
                {data.map((order, index) => {
                    return (
                        <div key={index} className="my-orders-order">
                            <img src={assets.parcel_icon || "https://cdn-icons-png.flaticon.com/512/1008/1008010.png"} alt="box" />
                            <p>{order.items.map((item, index) => {
                                if (index === order.items.length - 1) {
                                    return item.name + " x " + item.quantity;
                                } else {
                                    return item.name + " x " + item.quantity + ", ";
                                }
                            })}</p>
                            <p>${order.amount}.00</p>
                            <p>Items: {order.items.length}</p>
                            <p><span>&#x25cf;</span> <b>{order.status}</b></p>
                            <button onClick={fetchOrders}>Track Order</button>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default MyOrders;
