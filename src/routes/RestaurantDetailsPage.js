import React, { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import RestaurantFinder from "../apis/RestaurantFinder";
import AddReview from "../components/AddReview";
import Reviews from "../components/Reviews";
import { RestaurantContext } from "../context/RestaurantContext";

const RestaurantDetailsPage = () => {
  const { id } = useParams();
  const { selectedRestaurant, setSelectedRestaurant } =
    useContext(RestaurantContext);

  useEffect(() => {
    try {
      const fetchData = async () => {
        const { data } = await RestaurantFinder.get(`/${id}`);
        setSelectedRestaurant(data.data);
      };
      fetchData();
    } catch (error) {
      console.log(error);
    }
  }, []);
  console.log(selectedRestaurant);

  return (
    <div>
      {selectedRestaurant && (
        <>
          <div className="mt-3">
            <Reviews reviews={selectedRestaurant.reviews} />
          </div>
          <AddReview />
        </>
      )}
    </div>
  );
};

export default RestaurantDetailsPage;
