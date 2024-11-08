const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ message: "Title and Description are required" });
  }

  try {
    const newTask = new Task({ title, description });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find(req.query);
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title && !description) {
    return res
      .status(400)
      .json({ message: "Title or Description are required" });
  }

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (title) task.title = title;
    if (description) task.description = description;
    task.updated_at = Date.now();

    await task.save();
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.remove();
    res.status(200).json({ message: "Task removed" });
  } catch (error) {
    res.status(500).json({ message: "Error removing task", error });
  }
};

exports.completeTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.completed_at = task.completed_at ? null : new Date();
    task.updated_at = Date.now();
    await task.save();

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task status", error });
  }
};

const fs = require("fs");
const csvParser = require("csv-parser");

exports.importCSV = (req, res) => {
  const results = [];
  const filePath = req.file.path;

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", (row) => {
      results.push(row);
    })
    .on("end", async () => {
      try {
        const tasks = results.map((row) => ({
          title: row.title,
          description: row.description,
        }));

        await Task.insertMany(tasks);
        res.status(200).json({ message: "Tasks imported successfully" });
      } catch (error) {
        res.status(500).json({ message: "Error importing tasks", error });
      }
    });
};
