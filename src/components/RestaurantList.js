import React, { Fragment, useContext, useEffect } from "react";
import { useHistory } from "react-router";
import RestaurantFinder from "../apis/RestaurantFinder";
import { RestaurantContext } from "../context/RestaurantContext";

const RestaurantList = () => {
  const { restaurants, setRestaurants } = useContext(RestaurantContext);
  const history = useHistory();

  useEffect(() => {
    try {
      const fetchData = async () => {
        const res = await RestaurantFinder.get("/");
        setRestaurants(res.data.data.restaurants);
      };
      fetchData();
    } catch (error) {}
  }, [setRestaurants]);

  const handleUpdate = async (id) => {
    history.push(`/restaurants/${id}/update`);
  };

  const handleDelete = async (id) => {
    try {
      const res = await RestaurantFinder.delete(`/${id}`);
      setRestaurants(restaurants.filter((restaurant) => restaurant.id !== id));
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Fragment>
      <div className="list-group">
        <table className="table table-hover table-dark">
          <thead>
            <tr className="bg-primary">
              <th scope="col">Restaurant</th>
              <th scope="col">Location</th>
              <th scope="col">Price range</th>
              <th scope="col">Ratings</th>
              <th scope="col">Edit</th>
              <th scope="col">Delete</th>
            </tr>
          </thead>
          <tbody>
            {restaurants?.map((restaurant) => (
              <tr key={restaurant.id}>
                <td>{restaurant.name}</td>
                <td>{restaurant.location}</td>
                <td>{"$".repeat(restaurant.price_range)}</td>
                <td>reviews</td>
                <td>
                  <button
                    onClick={() => handleUpdate(restaurant.id)}
                    className="btn btn-warning"
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(restaurant.id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {/* <tr>
              <td>mcdonalds</td>
              <td>New York</td>
              <td>$$</td>
              <td>rating</td>
              <td>
                <button className="btn btn-warning">Update</button>
              </td>
              <td>
                <button className="btn btn-danger">Delete</button>
              </td>
            </tr>
            <tr>
              <td>mcdonalds</td>
              <td>New York</td>
              <td>$$</td>
              <td>rating</td>
              <td>
                <button className="btn btn-warning">Update</button>
              </td>
              <td>
                <button className="btn btn-danger">Delete</button>
              </td>
            </tr> */}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
};

export default RestaurantList;
