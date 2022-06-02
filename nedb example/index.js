const Datastore = require("nedb");

const tickets = new Datastore({
  filename: "db/tables/tickets.db",
  autoload: true,
  timestampData: true,
});

const items = new Datastore({
  filename: "db/tables/items.db",
  autoload: true,
  timestampData: true,
});

// gets all tickets
const getAlltickets = async (status) => {
  let documents = await new Promise((resolve, reject) => {
    if (status == "recent") {
      tickets
        .find({ id: { $exists: true } })
        .sort({ createdAt: -1 })
        .exec((err, doc) => {
          resolve(doc);
        });
    } else {
      tickets.find(
        { id: { $exists: true }, status: status },
        async (err, doc) => {
          resolve(doc);
        }
      );
    }
  });
  return documents;
};

// gets a single ticket based on id
const getTicket = async (ticketId) => {
  let documents = await new Promise((resolve, reject) => {
    tickets.findOne({ id: parseInt(ticketId) }, async (err, doc) => {
      resolve(doc);
    });
  });
  return documents;
};

// search for ticket based on input
const searchTicket = async (input) => {
  const newRegex = new RegExp(parseInt(input));
  let documents = await new Promise((resolve, reject) => {
    tickets.find({ id: { $exists: true } }, async (err, doc) => {
      resolve(doc);
    });
  });
  const result = documents.filter((t) => t.id.toString().includes(input));
  return result;
};

// post new ticket to db
const createTicket = async (post, id) => {
  let duplicate = await new Promise((resolve, reject) => {
    tickets.find({ id: parseInt(id) }, function (err, docs) {
      docs.length > 0 ? resolve(true) : resolve(false);
    });
  });

  if (!duplicate) {
    console.log("post", post, id);
    tickets.insert(
      {
        id: post.ticketInfo.ticketID,
        customerID: post.ticketInfo.customerID,
        customerName: post.ticketInfo.customerName,
        customerAddressLine1: post.ticketInfo.customerAddressLine1,
        customerAddressLine2: post.ticketInfo.customerAddressLine2,
        customerCity: post.ticketInfo.customerCity,
        customerState: post.ticketInfo.customerState,
        customerZip: post.ticketInfo.customerZip,
        customerCountry: post.ticketInfo.customerCountry,
        contactName: post.ticketInfo.contactName,
        contactPhoneNumber: post.ticketInfo.contactPhoneNumber,
        contactEmail: post.ticketInfo.contactEmail,
        status: "started",
      },
      (err, doc) => {}
    );
  } else {
    throw new Error("There is a ticket with this id already");
    // return {
    //   error: {
    //     msg: "There is a ticket with this id already",
    //   },
    // };
  }
};

// post item to ticket
const postItemToticketIndb = async (item) => {
  console.log("item", item);
  let duplicate = await new Promise((resolve, reject) => {
    items.find({ itemSerial: item.itemSerial }, function (err, docs) {
      console.log("docsx", docs);
      docs.length > 0 ? resolve(true) : resolve(false);
    });
  });

  if (!duplicate) {
    items.insert(item, (err, doc) => {});
  } else {
    throw new Error("There is an item with this serial already");
  }
};

const serialIsTaken = async (serialNo) => {
  console.log("item", serialNo);
  let duplicate = await new Promise((resolve, reject) => {
    items.find({ itemSerial: serialNo }, function (err, docs) {
      console.log("docs", docs);
      docs.length > 0 ? resolve(true) : resolve(false);
    });
  });

  if (!duplicate) {
    return true;
  } else {
    return false;
  }
};

// get items for a ticket
const GetTicketItems = async (ticket) => {
  const documents = await new Promise((resolve, reject) => {
    items.find({ ticketId: parseInt(ticket) }, (err, doc) => {
      resolve(doc);
    });
  });
  return documents;
};

// change status of a ticket
const changeTicketStatus = async (id, ticketStatus) => {
  tickets.update(
    { id: parseInt(id) },
    { $set: { status: ticketStatus } },
    { multi: false }
  );
  tickets.persistence.compactDatafile();
};

module.exports = {
  getAlltickets,
  getTicket,
  searchTicket,
  createTicket,
  changeTicketStatus,
  // getItemBySerialNumber,
  // getItemBySerialNumberAndItemName,
  postItemToticketIndb,
  GetTicketItems,
  serialIsTaken,
};
