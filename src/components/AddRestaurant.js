import React, { useContext, useState } from "react";
import RestaurantFinder from "../apis/RestaurantFinder";
import { RestaurantContext } from "../context/RestaurantContext";

const AddRestaurant = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const { addRestaurants } = useContext(RestaurantContext);

  const handleOnClick = async (e) => {
    e.preventDefault();
    try {
      const res = await RestaurantFinder.post("/", {
        name: name,
        location: location,
        price_range: priceRange,
      });
      addRestaurants(res.data.data.restaurant);
      setName("");
      setLocation("");
      setPriceRange("");
    } catch (error) {}
  };

  return (
    <div className="mb-4">
      <form action="">
        <div className="form-row">
          <div className="col">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              className="form-control"
              placeholder="Name"
            />
          </div>
          <div className="col">
            <input
              type="text"
              className="form-control"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="col">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="custom-select my-1 mr-sm-2"
            >
              <option disabled>Price range</option>
              <option value="1">$</option>
              <option value="2">$$</option>
              <option value="3">$$$</option>
              <option value="4">$$$$</option>
              <option value="5">$$$$$</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            onClick={handleOnClick}
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRestaurant;
