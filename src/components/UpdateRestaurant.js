import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import RestaurantFinder from "../apis/RestaurantFinder";

const UpdateRestaurant = () => {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const { id } = useParams();
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await RestaurantFinder.get(`/${id}`);
        const { name, location, price_range } = res.data.data.restaurant;
        setName(name);
        setLocation(location);
        setPriceRange(price_range);
      } catch (error) {}
    };
    fetchData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    await RestaurantFinder.put(`/${id}`, {
      name: name,
      location: location,
      price_range: priceRange,
    });
    history.push("/");
  };

  return (
    <div>
      <form action="">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            id="name"
            type="text"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="location">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            id="location"
            type="text"
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label htmlFor="price_range">Price range</label>
          <input
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            id="price_range"
            type="number"
            className="form-control"
          />
        </div>
        <button
          type="submit"
          onClick={(e) => handleUpdate(e)}
          className="btn btn-primary"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default UpdateRestaurant;
