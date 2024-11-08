const express = require("express");
const multer = require("multer");
const path = require("path");
const taskController = require("../controllers/taskController");

const router = express.Router();

const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname) !== ".csv") {
      return cb(new Error("File must be a CSV"));
    }
    cb(null, true);
  },
});

router.post("/tasks", taskController.createTask);

router.get("/tasks", taskController.getTasks);

router.put("/tasks/:id", taskController.updateTask);

router.delete("/tasks/:id", taskController.deleteTask);

router.patch("/tasks/:id/complete", taskController.completeTask);

router.post("/tasks/import", upload.single("file"), taskController.importCSV);

module.exports = router;
