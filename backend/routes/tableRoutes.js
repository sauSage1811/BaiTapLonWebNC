const express = require("express");
const router = express.Router();

const tableController = require("../controllers/tableController");

router.get("/", tableController.index);
router.post("/", tableController.store);
router.get("/:id", tableController.show);
router.put("/:id", tableController.update);
router.put("/:id/status", tableController.updateStatus);
router.delete("/:id", tableController.destroy);

module.exports = router;
