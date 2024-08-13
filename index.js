const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
require("dotenv").config();

const users = require("./models/user.model");
const homesection = require("./models/home.model");
const Service = require("./models/service.model");
const MembersModel = require("./models/members.model");

const app = express();
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send(
    "This server is protected by INSA (Intelligent Network Security Administration). Any unauthorized attempts to access or bypass these security measures will be closely monitored and may result in legal consequences. Ensure that you have proper authorization before accessing or modifying any data."
  );
});

app.use("/uploads/", express.static(path.join(__dirname, "uploads")));

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  users.findOne({ email: email }).then((user) => {
    if (user) {
      res.json("Already registered");
    } else {
      users
        .create(req.body)
        .then((user) => res.json(user))
        .catch((err) => res.json(err));
    }
  });
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  users.findOne({ email: email }).then((user) => {
    if (user) {
      // If user found then these 2 cases
      if (user.password === password) {
        res.json("Success");
      } else {
        res.json("Wrong password");
      }
    }
    // If user not found then
    else {
      res.json("No records found! ");
    }
  });
});

app.post("/createHome", async (req, res) => {
  try {
    const { childrenNumber, mainTitle } = req.body;

    // Create a new instance of HomeModel
    const newHome = new homesection({ childrenNumber, mainTitle });

    // Save to MongoDB
    const savedHome = await newHome.save();

    // Send response
    res.status(201).json({
      message: "Home data saved successfully",
      data: savedHome,
    });
  } catch (error) {
    console.error("Error saving home data:", error);
    res.status(500).json({
      message: "Error saving home data",
      error: error.message,
    });
  }
});

app.put("/editHome", async (req, res) => {
  try {
    const id = "66b6f1087a4dba1e601378b8";
    const { childrenNumber, mainTitle } = req.body;

    const updatedHome = await homesection.findByIdAndUpdate(
      id,
      { childrenNumber, mainTitle },
      { new: true, runValidators: true }
    );

    if (!updatedHome) {
      return res.status(404).json({ message: "Home data not found" });
    }
    res.status(200).json({
      message: "Home data updated successfully",
      data: updatedHome,
    });
  } catch (error) {
    console.error("Error updating home data:", error);
    res.status(500).json({
      message: "Error updating home data",
      error: error.message,
    });
  }
});

app.get("/getHomeSection", async (req, res) => {
  try {
    const homeData = await homesection.find({});
    res.json(homeData); // Send JSON response
  } catch (error) {
    console.error("Error fetching home data:", error);
    res
      .status(500)
      .json({ message: "Error fetching home data", error: error.message });
  }
});

app.get("/getHomeSection/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const homeData = await homesection.findById(id);

    if (!homeData) {
      return res.status(404).json({ message: "Home data not found" });
    }

    res.json(homeData); // Send JSON response
  } catch (error) {
    console.error("Error fetching home data by ID:", error);
    res
      .status(500)
      .json({ message: "Error fetching home data", error: error.message });
  }
});

app.post(
  "/services",
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const image =
        req.files && req.files["image"]
          ? req.files["image"][0].filename
          : "corruptedimage.jpg";
      const newService = new Service({ image, title, description });
      const savedService = await newService.save();

      res.status(201).json({
        message: "Service created successfully",
        data: savedService,
      });
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({
        message: "Error creating service",
        error: error.message,
      });
    }
  }
);

// Define GET route to fetch all services
app.get("/services", async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json({
      message: "Services retrieved successfully",
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      message: "Error fetching services",
      error: error.message,
    });
  }
});

// Define PUT route to update a specific service by ID
app.put(
  "/services/:id",
  upload.fields([{ name: "image", maxCount: 1 }]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;
      const image =
        req.files && req.files["image"]
          ? req.files["image"][0].filename
          : "corruptedimage.jpg";

      const updatedService = await Service.findByIdAndUpdate(
        id,
        { title, description, image },
        { new: true }
      );

      res.status(200).json({
        message: "Service updated successfully",
        data: updatedService,
      });
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({
        message: "Error updating service",
        error: error.message,
      });
    }
  }
);
// Define Delete route to Delete a specific service by ID
app.delete("/services/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      message: "Service deleted successfully",
      data: deletedService,
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      message: "Error deleting service",
      error: error.message,
    });
  }
});
// Find a service by its ID
app.get("/services/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json({
      message: "Service retrieved successfully",
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service by ID:", error);
    res.status(500).json({
      message: "Error fetching service",
      error: error.message,
    });
  }
});

// Define POST route to create a new member
app.post("/members", upload.single("image"), async (req, res) => {
  try {
    const { name, message } = req.body;
    const image = req.file ? req.file.filename : "default-image.jpg"; // Use default image if no file uploaded

    const newMember = new MembersModel({ image, name, message });
    const savedMember = await newMember.save();

    res.status(201).json({
      message: "Member created successfully",
      data: savedMember,
    });
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(500).json({
      message: "Error creating member",
      error: error.message,
    });
  }
});

// Define GET route to fetch all members
app.get("/members", async (req, res) => {
  try {
    const members = await MembersModel.find();
    res.status(200).json({
      message: "Members retrieved successfully",
      data: members,
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({
      message: "Error fetching members",
      error: error.message,
    });
  }
});

// Define GET route to fetch a specific member by ID
app.get("/members/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const member = await MembersModel.findById(id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({
      message: "Member retrieved successfully",
      data: member,
    });
  } catch (error) {
    console.error("Error fetching member by ID:", error);
    res.status(500).json({
      message: "Error fetching member",
      error: error.message,
    });
  }
});

// Define PUT route to update a specific member by ID
app.put("/members/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, message } = req.body;
    const image = req.file ? req.file.filename : "default-image.jpg";

    const updatedMember = await MembersModel.findByIdAndUpdate(
      id,
      { image, name, message },
      { new: true }
    );

    res.status(200).json({
      message: "Member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({
      message: "Error updating member",
      error: error.message,
    });
  }
});

// Define DELETE route to remove a specific member by ID
app.delete("/members/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMember = await MembersModel.findByIdAndDelete(id);

    if (!deletedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({
      message: "Member deleted successfully",
      data: deletedMember,
    });
  } catch (error) {
    console.error("Error deleting member:", error);
    res.status(500).json({
      message: "Error deleting member",
      error: error.message,
    });
  }
});

// Configure multer if needed (for handling file uploads)
// const upload = multer({ dest: 'uploads/' });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {});
    console.log("Connected to DB");
  } catch (error) {
    console.error("Error connecting to DB", error);
  }
};

run();

app.listen(process.env.PORT, () => {
  console.log(`server listening on ${process.env.PORT || 5000}`);
});

// app.post("/updateHomeSection/:id", updateUpload.fields([
//   { name: 'images', maxCount: 1 },
// ]), async (req, res) => {
//   const id = req.params.id;
//   let body = req.body;

//   console.log('Received files:', req.files);
//   console.log('Received body:', req.body);

//   body['images'] = req.files && req.files['images'] ? req.files['images'][0].filename : "couruptedimage.jpg";

//   console.log('Updated body:', body);

//   homesection.findByIdAndUpdate(id, body)
//     .then(product => res.json(product))
//     .catch(err => res.json(err));
// });

// app.use("/uploads/", express.static(path.join(__dirname, "uploads")));
// const run = async ()=>{
//     await mongoose.connect('mongodb+srv://admin:admin123@arecommerse.tas3bs3.mongodb.net/?retryWrites=true&w=majority&appName=arecommerse', {})
//     console.log("connected to db")

// app.post('/login', (req, res) => {
//     const { email, password } = req.body;
//     users.findOne({ email: email })
//       .then(user => {
//         if (user) {
//           // If user found then these 2 cases
//           if (user.password === password) {
//             res.json("Success");
//           }
//           else {
//             res.json("Wrong password");
//           }
//         }
//         // If user not found then
//         else {
//           res.json("No records found! ");
//         }
//       });
//     });

// app.get('/getproducts', (req, res)=>{
//     products.find({})
//       .then(product=>res.json(product))
//       .catch(err=>res.json(err))
//   })
//   app.get('/getProducts/:id', (req, res) => {
//     const id = req.params.id;
//     products.findById({_id:id})
//         .then(product => res.json(product))
//         .catch(err => res.json(err));
//   });
// app.post("/updateProduct/:id", updateUpload.fields([
//     { name: 'images', maxCount: 1 },
//     { name: 'model', maxCount: 1 },
//     { name: 'imagesT', maxCount: 1 },
//     { name: 'imagesR', maxCount: 1 },
//     { name: 'imagesL', maxCount: 1 }
//   ]), async (req, res) => {
//     const id = req.params.id;
//     let body = req.body;

//     console.log('Received files:', req.files);
//     console.log('Received body:', req.body);

//     body['model'] = req.files && req.files['model'] ? req.files['model'][0].filename : "coruptedimage.jpg";
//     body['images'] = req.files && req.files['images'] ? req.files['images'][0].filename : "couruptedimage.jpg";
//     body['imagesT'] = req.files && req.files['imagesT'] ? req.files['imagesT'][0].filename : "couruptedimage.jpg";
//     body['imagesR'] = req.files && req.files['imagesR'] ? req.files['imagesR'][0].filename : "couruptedimage.jpg";
//     body['imagesL'] = req.files && req.files['imagesL'] ? req.files['imagesL'][0].filename : "couruptedimage.jpg";

//     console.log('Updated body:', body);

//     products.findByIdAndUpdate(id, body)
//       .then(product => res.json(product))
//       .catch(err => res.json(err));
//   });
// app.post("/createProducts", upload.fields([
//     { name: 'images', maxCount: 1 },
//     { name: 'model', maxCount: 1 },
//     { name: 'imagesT', maxCount: 1 },
//     { name: 'imagesR', maxCount: 1 },
//     { name: 'imagesL', maxCount: 1 }
//   ]), async (req, res) => {
//     try {
//       const {
//         name,
//         description,
//         catagory,
//         price,
//         availability,
//         color,
//         quantity,
//         tags,
//         material,
//         size,
//         features,
//         status,
//         seller,
//       } = req.body;

//       // Ensure req.files is defined before accessing its properties
//       const images = req.files && req.files['images'] ? req.files['images'][0].filename : "coruptedimage.jpg";
//       const imagesT = req.files && req.files['imagesT'] ? req.files['imagesT'][0].filename : "coruptedimage.jpg";
//       const imagesR = req.files && req.files['imagesR'] ? req.files['imagesR'][0].filename : "coruptedimage.jpg";
//       const imagesL = req.files && req.files['imagesL'] ? req.files['imagesL'][0].filename : "coruptedimage.jpg";
//       const model = req.files && req.files['model'] ? req.files['model'][0].filename : "coruptedimage.jpg";

//       const product = new products({
//         name,
//         catagory,
//         availability,
//         price,
//         description,
//         features,
//         color,
//         quantity,
//         size,
//         material,
//         images,
//         model,
//         imagesT,
//         imagesR,
//         imagesL,
//         tags,
//         seller,
//         status,
//       });

//       await product.save();
//       res.status(201).json({ message: "Product created successfully", product });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Failed to create product" });
//     }
//   });
