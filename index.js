import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import redis from "redis";
import { promisify } from "util";

import { User } from "./models/User.js";
import { Post } from "./models/Post.js";

// create redis client
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// CREATE
app.post("/users", async (req, res) => {
  const { name, email, role } = req.body;

  try {
    const user = await User.create({ name, email, role });

    return res.status(201).json(user);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ success: false, error });
  }
});

// READ
app.get("/users", async (req, res) => {
  try {
    const getRes = await getAsync("allUsers");
    if (getRes) {
      console.log("Used Cache");
      return res.json({ success: true, data: JSON.parse(getRes) });
    }

    const users = await User.find({});

    await setAsync(
      "allUsers", //
      JSON.stringify({ users }), //
      "EX", //
      60 //
    );

    console.log("DB Used");
    return res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ success: false, error });
  }
});

// UPDATE
app.patch("/users/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, role } = req.body;

  try {
    const user = await User.findById(id);

    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ success: false, error });
  }
});

// DELETE
app.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(id);

    return res.status(204).json(user);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ success: false, error });
  }
});

// FINDONE
app.get("/users/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const getRes = await getAsync(id);
    if (getRes) {
      console.log("Used Cache");
      return res.json({ success: true, data: JSON.parse(getRes) });
    }
    let user = await User.findById(id);

    if (!user)
      return res.status(404).json({ success: false, error: "User not found" });

    await setAsync(
      id, //
      JSON.stringify({ user }), //
      "EX", //
      60 //
    );

    console.log("DB Used");
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ success: false, error });
  }
});

/* Posts */
// CREATE
app.post("/posts", async (req, res) => {
  const { title, body, userId } = req.body;

  try {
    const user = await User.findById(userId);

    const post = await Post.create({ title, body, user: user.id });

    return res.status(201).json(post);
  } catch (err) {
    console.error(err);

    return res.status(500).json({ success: false, error: err });
  }
});

// READ
app.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find({}).populate("user");

    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ success: false, error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => console.log("Database connected"))
    .catch((err) => console.error(err));
});
