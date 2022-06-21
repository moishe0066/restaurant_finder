const { Pool } = require("pg");
const config = require("config");
const dayjs = require("dayjs");
const timestamp = dayjs().$d;
const timeStampForLogs = dayjs().format("YYYY-MM-DD HH:mm");

const pool = new Pool(config.get("postgres"));

// post new ticket to db
const createTicket = async (post, pickup, id) => {
  try {
    let res;
    let response;
    if (post === undefined) {
      response = await pool.query(
        "SELECT * FROM tickets WHERE pickup_name = $1",
        [pickup]
      );
      if (response.rowCount < 1) {
        response = await pool.query("SELECT * FROM tickets WHERE id = $1", [
          id,
        ]);
      }
    } else {
      let x = await pool.query("SELECT * FROM tickets WHERE pickup_name = $1", [
        post.ticketInfo.pickup_name,
      ]);
      if (x.rowCount > 0) {
        response = x;
      } else {
        let y = await pool.query("SELECT * FROM tickets WHERE ticket_id = $1", [
          post.ticketInfo.ticket_id,
        ]);
        response = y;
      }
    }
    if (
      (response.rowCount < 1 && post !== undefined) ||
      (post !== undefined &&
        post.ticketInfo &&
        post.ticketInfo.pickup_name &&
        post.ticketInfo.pickup_name.length > 0 &&
        response.rows[0].pickup_name !== post.ticketInfo.pickup_name)
    ) {
      res = await pool.query(
        `INSERT INTO tickets (
              pickup_name,
              ticket_id,
              ticket_summary, 
              customer_id, 
              customer_name,
              customer_address_line1,
              customer_address_line2,
              customer_city,
              customer_state,
              customer_zip,
              customer_country,
              contact_name,
              contact_phone_number,
              contact_email,
              status
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [
          post.ticketInfo.pickup_name
            ? post.ticketInfo.pickup_name.replace(/\W+/g, "_")
            : post.ticketInfo.pickup_name,
          post.ticketInfo.ticket_id,
          post.ticketInfo.ticket_summary,
          post.ticketInfo.customer_id,
          post.ticketInfo.customer_name,
          post.ticketInfo.customer_address_line1,
          post.ticketInfo.customer_address_line2,
          post.ticketInfo.customer_city,
          post.ticketInfo.customer_state,
          post.ticketInfo.customer_zip,
          post.ticketInfo.customer_country,
          post.ticketInfo.contact_name,
          post.ticketInfo.contact_phone_number,
          post.ticketInfo.contact_email,
          "started",
        ]
      );
    } else {
      res = response;
    }
    return res.rows;
  } catch (error) {
    console.log("post ticket error", error);
    return error;
  }
};

// get all tickets from db
const getAlltickets = async (status) => {
  if (status === "recent") {
    const res = await pool.query(
      "SELECT * from tickets ORDER BY created_at DESC"
    );
    return res.rows;
  } else {
    const res = await pool.query(
      "SELECT * from tickets WHERE status = $1 ORDER BY created_at ASC",
      [status]
    );
    return res.rows;
  }
};

// get single tickets from db
const getTicket = async (id) => {
  const res = await pool.query(`SELECT * from tickets WHERE id = $1`, [
    parseInt(id),
  ]);
  return res.rows;
};

// change ticket fields
const changeTicketField = async (id, field) => {
  let res;
  if (field.hasOwnProperty("status")) {
    res = await pool.query(
      "UPDATE tickets SET status = $1 WHERE id = $2 RETURNING *",
      [field.status, id]
    );
  } else if (field.hasOwnProperty("notes")) {
    res = await pool.query(
      "UPDATE tickets SET notes = $1 WHERE id = $2 RETURNING *",
      [field.notes, id]
    );
  } else {
    console.log("field is empty");
  }

  return res.rows;
};

// update fields in item
const updateItem = async (id, field) => {
  let res;
  if (field.hasOwnProperty("status")) {
    res = await pool.query(
      "UPDATE items SET status = $1 WHERE id = $2 RETURNING *",
      [field.status, id]
    );
  }
  return res.rows;
};

// search for ticket based on input
const searchTicket = async (input) => {
  console.log("input", input);
  let regex = `%${input}%`;
  const res = await pool.query(
    `SELECT * from tickets WHERE 
      CAST(ticket_id AS text) LIKE $1 OR 
      CAST(pickup_name AS text) LIKE $1 OR 
      id IN (SELECT i.pickup_id FROM items AS i WHERE 
        LOWER(CAST(i.serial AS text)) LIKE $1 AND status = $2 
        OR LOWER(CAST(i.description AS text)) LIKE $1 AND status = $2)`,
    [regex, "open"]
  );
  return res.rows;
};

// search for logs based on input
const searchLogs = async (id, input) => {
  let regex = `%${input}%`;
  const res = await pool.query(
    `SELECT * FROM logs WHERE 
      pickup_id = $1 AND LOWER(CAST(description AS text)) LIKE $2 
      OR pickup_id = $1 AND LOWER(CAST(area AS text)) LIKE $2
      OR pickup_id = $1 AND LOWER(CAST(action AS text)) LIKE $2`,
    [id, regex]
  );
  return res.rows;
};

// save amount of printed labels
const updateLabelStatus = async (status, labels) => {
  const updatedLabels = [];
  if (status === "printed") {
    for (const label of labels) {
      const res = await pool.query(
        "UPDATE labels SET status = $1, date_printed = $2 WHERE pickup_id = $3 AND label_no = $4 RETURNING *",
        [status, timestamp, label.pickup_id, label.label_no]
      );
      updatedLabels.push(res.rows[0]);
    }
  } else if (status === "picked_up") {
    for (const label of labels) {
      const res = await pool.query(
        "UPDATE labels SET status = $1, date_picked_up = $2 WHERE pickup_id = $3 AND label_no = $4 RETURNING *",
        [status, timestamp, label.pickup_id, label.label_no]
      );
      updatedLabels.push(res.rows[0]);
    }
  }

  return updatedLabels;
};

{
  /* item related functions */
}
const postItemToticketIndb = async (post) => {
  console.log("### item", post, "### item");
  const res = await pool.query(
    `INSERT INTO items (
          id, 
          serial, 
          description,
          catalog_item_id,
          label_no,
          pickup_id,
          pickup_name,
          ticket_id,
          status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      post.item_id,
      post.item_serial,
      post.item_name,
      post.catalog_item_id,
      post.label_no,
      post.pickup_id,
      post.pickup_name,
      post.ticket_id,
      post.status,
    ]
  );
  return res.rows;
};

// get items for ticket
const getTicketItems = async (pickupId) => {
  let res = await pool.query(
    "SELECT * FROM items WHERE pickup_id = $1 AND status = $2",
    [pickupId, "open"]
  );

  return res.rows;
};

// get items for label
const getLabelItems = async (pickupId, labelNo) => {
  let res = await pool.query(
    "SELECT * FROM items WHERE pickup_id = $1 AND label_no = $2 AND status = $3",
    [pickupId, labelNo, "open"]
  );

  return res.rows;
};

// delete item from ticket
const deleteItem = async (id) => {
  const res = await pool.query("DELETE FROM items WHERE id = $1 RETURNING *", [
    id,
  ]);
  return res.rows;
};

// map over duplicate serials
const checkDups = async (serial, serialEl) => {
  const res = await pool.query(
    "SELECT * FROM items WHERE serial = $1 AND description = $2",
    [serial, serialEl.catalogItem.identifier]
  );
  if (res.rowCount > 0) {
    return true;
  } else {
    return false;
  }
};

// check if serial is available
const serialIsTaken = async (serialNo, cwserialObject) => {
  let res;
  if (cwserialObject) {
    res = [];
    for (i = 0; i < cwserialObject.length; i++) {
      let k = i;
      let temp = await checkDups(serialNo, cwserialObject[k]);
      !temp && res.push(cwserialObject[k]);
    }
    return res;
  }

  res = await pool.query("SELECT * FROM items WHERE serial = $1", [serialNo]);

  if (res.rowCount && res.rowCount > 0) {
    return {
      isAvailable: false,
      location: {
        pickup: res.rows[0].pickup_name
          ? res.rows[0].pickup_name
          : res.rows[0].pickup_id,
        ticket: res.rows[0].ticket_id,
      },
    };
  } else {
    console.log("item is availabe");
    return {
      isAvailable: true,
    };
  }
};

// look up or create new user
const findOrCreateUser = async (userInfo, username) => {
  let res;
  try {
    const user = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      (userInfo && userInfo.mail) || username,
    ]);
    if (user.rowCount > 0) {
      res = user;
    } else {
      res = await pool.query(
        `INSERT INTO users (email, name, role) VALUES ($1, $2, $3) RETURNING *`,
        [userInfo.mail, userInfo.name, userInfo.role]
      );
    }
  } catch (error) {
    console.log("error finding/creating user", error);
  }
  return res.rows[0];
};

// create logs
const logAction = async (post, user, action, area, misc) => {
  const createLog = async (v1, v2) => {
    const response = await pool.query(
      `INSERT INTO logs (pickup_id, user_id, action, area, description) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [v1, user, action, area, v2]
    );
    return response;
  };
  let res;
  if (area === "auth") {
    res = await createLog(
      post,
      action === "failed_login"
        ? `${user} tried to login at ${timeStampForLogs}, login was unsuccessful due to lack of role assignment`
        : `${user} logged in at ${timeStampForLogs}, login was successful`
    );
  } else if (action === "added" && area === "items") {
    res = await createLog(
      post.pickup_id,
      `${user} scanned and added item with serial ${post.serial} at ${timeStampForLogs}`
    );
  } else if (action === "added" && area === "pickups") {
    res = await createLog(
      post.id,
      `${user} created new ticket/pickup for ${post.customer_name} 
      ${
        post.pickup_name !== null
          ? "with pickup name " + post.pickup_name
          : "with pickup id: " + post.id
      } at ${timeStampForLogs}`
    );
  } else if (action === "updated" && area === "pickups") {
    res = await createLog(
      post.id,
      `${user} updated ${Object.keys(misc)[0]} in ticket/pickup: ${
        post.pickup_name !== null ? post.pickup_name : post.id
      } at ${timeStampForLogs}`
    );
  } else if (action === "added" && area === "labels") {
    res = await createLog(
      post.pickup_id,
      `${user} created label ${post.label_no} in pickup: ${post.pickup_id} at ${timeStampForLogs}`
    );
  } else if (action === "updated" && area === "labels") {
    res = await createLog(
      post.pickup_id,
      `${user} ${misc} labels/s ${Object.keys(post).map(
        (label) => label.label_no
      )} to ticket/pickup: ${post.pickup_id} at ${timeStampForLogs}`
    );
  } else if (action === "returned" && area === "items") {
    res = await createLog(
      post.id,
      `${user} returned '${post.description}' with the serial '${
        post.serial
      }' from ticket/pickup: ${
        post.pickup_name !== null ? post.pickup_name : post.id
      } at ${timeStampForLogs}`
    );
  } else if (action === "billed" && area === "items") {
    res = await createLog(
      post.ticket_id,
      `${user} billed item with serial id'${post.serial_id}' to CW ticket ${post.ticket_id} at ${timeStampForLogs}`
    );
  } else if (action === "deleted" && area === "items") {
    res = await createLog(
      post.pickup_id,
      `${user} deleted item '${post.description}' with serial '${post.serial}' from pickup ${post.pickup_name} with id '${post.pickup_id}' at ${timeStampForLogs}`
    );
  } else {
    return;
  }
  return res.rows;
};

// gets labels
const getLabels = async (pickup_id) => {
  const res = await pool.query(
    `SELECT labels.*, 
      (SELECT count(i.id) 
        FROM items i 
        WHERE i.pickup_id = labels.pickup_id 
        AND i.label_no = labels.label_no
      ) num_items
    from labels
    WHERE pickup_id = $1`,
    [pickup_id]
  );
  const latest = await pool.query(
    `SELECT label_no FROM items where pickup_id = $1
    ORDER BY created_at desc LIMIT 1`,
    [pickup_id]
  );
  return {
    labels: res.rows,
    recent: latest.rowCount > 0 ? latest.rows[0].label_no : 1,
  };
};

// find or create label
const findOrCreateLabel = async (pickup_id, label_no, user) => {
  let res;
  res = await pool.query(
    `SELECT * from labels WHERE pickup_id = $1 AND label_no = $2`,
    [pickup_id, label_no]
  );
  if (res.rowCount === 0) {
    res = await pool.query(
      `INSERT INTO labels (pickup_id, label_no, status) VALUES ($1, $2, $3) RETURNING *`,
      [pickup_id, label_no, "open"]
    );
    logAction(res.rows[0], user, "added", "labels");
  }
  return res.rows;
};

// get all logs
const getLogs = async (id) => {
  const res = await pool.query(
    `SELECT * FROM logs WHERE pickup_id = $1 ORDER BY date_inserted DESC`,
    [id]
  );
  return res.rows;
};

module.exports = {
  createTicket,
  getTicket,
  changeTicketField,
  getAlltickets,
  searchTicket,
  updateLabelStatus,
  postItemToticketIndb,
  getTicketItems,
  getLabelItems,
  serialIsTaken,
  deleteItem,
  updateItem,
  findOrCreateUser,
  logAction,
  getLabels,
  findOrCreateLabel,
  getLogs,
  searchLogs,
};
