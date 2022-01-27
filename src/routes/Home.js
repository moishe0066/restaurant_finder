import React, { Fragment } from "react";
import AddRestaurant from "../components/AddRestaurant";
import Header from "../components/Header";
import RestaurantList from "../components/RestaurantList";

const Home = () => {
  return (
    <Fragment>
      <Header />
      <AddRestaurant />
      <RestaurantList />
    </Fragment>
  );
};

export default Home;
