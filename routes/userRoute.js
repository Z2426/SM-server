import express from "express";
import { userAuth, isAdmin } from "../middleware/authMiddleware.js";
import {
  requestPasswordReset,
  verifyEmail,
  resetPassword,
  changePassword,
  friendRequest,
  respondToFriendRequest,
  getFriendRequest,
  getUser,
  updateUser,unFriend , toggleFollow,
  handleBlock,
  getProfile,
  unfriendUser
} from "../controller/userController.js";
const router = express.Router();
//router
// ----MANAGE FRIEND
//unfriend
router.delete('/unfriend/:friendId', userAuth,unfriendUser)
//show profile
router.get("/profile/:friendId?",userAuth,getProfile)
// block / unblock
router.post("/block/:userId",userAuth,handleBlock)
// toggle follow
router.post('/follow/:userId',userAuth, toggleFollow)
//unfriend
router.post("/unfriend/:friendId",userAuth,unFriend)
//accept /deny friend request
router.post("/friend-requests/respond", userAuth, respondToFriendRequest)
// friend request
router.post("/friend-request", userAuth, friendRequest)
router.get("/get-friend-request", userAuth, getFriendRequest)
// -----USER-------

// user routes
router.get("/get-user/:userId?", userAuth, getUser)
router.put("/update-user", userAuth, updateUser)
//verify email
router.get("/verify/:userId/:token",verifyEmail)
//Password reset
router.get("/reset-password/:userId/:token", resetPassword);//2
router.post("/request-passwordreset", requestPasswordReset) //1
router.post("/reset-password", changePassword) //3
router.get("/", (req, res) => {
  res.send("userRoute");
})
export default router;
