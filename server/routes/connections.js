const express = require("express")
const {
  sendConnectionRequest,
  acceptConnection,
  rejectConnection,
  getMyConnections,
  blockUser,
  removeConnection,
} = require("../controllers/connectionController")
const { protect } = require("../middleware/auth")

const router = express.Router()

router.post("/send-request/:userId", protect, sendConnectionRequest)
router.put("/accept/:connectionId", protect, acceptConnection)
router.put("/reject/:connectionId", protect, rejectConnection)
router.put("/block/:connectionId", protect, blockUser)
router.get("/me", protect, getMyConnections)
router.delete("/remove/:connectionId", protect, removeConnection);

module.exports = router
