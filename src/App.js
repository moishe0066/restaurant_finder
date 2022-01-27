import React, { Fragment } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { RestaurantContextProvider } from "./context/RestaurantContext";
import Home from "./routes/Home";
import RestaurantDetailsPage from "./routes/RestaurantDetailsPage";
import RestaurantUpdatePage from "./routes/UpdateRestaurantPager";

const App = () => {
  return (
    <RestaurantContextProvider>
      <div className="container">
        <Router>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route
              exact
              path="/restaurants/:id"
              component={RestaurantDetailsPage}
            />
            <Route
              exact
              path="/restaurants/:id/update"
              component={RestaurantUpdatePage}
            />
          </Switch>
        </Router>
      </div>
    </RestaurantContextProvider>
  );
};

export default App;
