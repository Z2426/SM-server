import mongoose from "mongoose";
import Users from "../models/userModel.js";
import FriendsRequest from "../models/friendRequestModel.js";
import Verification from "../models/emailVerificationModel.js";
import { compareString, hashString } from "../untils/index.js";
import passwordReset from "../models/passwordResetModel.js";
import { resetPasswordLink } from "../untils/sendEmail.js";
import Posts from "../models/postModel.js";
//import { followNotification } from "./notifiController.js";
// unfriend
export const unfriendUser = async (req, res, next) => {
  try {
    const requesterId = req.body.user.userId; // ID của người hủy kết bạn
    const friendId  = req.params.friendId; // ID của người bạn cần hủy kết bạn

    // Tìm người dùng và người bạn
    const [user, friend] = await Promise.all([
      Users.findById(requesterId),
      Users.findById(friendId),
    ]);

    // Kiểm tra nếu người dùng hoặc người bạn không tồn tại
    if (!user || !friend) {
      return res.status(404).json({
        success: false,
        message: "Người dùng hoặc người bạn không tồn tại.",
      });
    }

    // Xóa người bạn khỏi danh sách bạn bè của người dùng
    user.friends = user.friends.filter(id => id.toString() !== friendId);

    // Xóa người dùng khỏi danh sách bạn bè của người bạn
    friend.friends = friend.friends.filter(id => id.toString() !== requesterId);

    // Lưu thay đổi
    await Promise.all([user.save(), friend.save()]);

    res.status(200).json({
      success: true,
      message: "Đã hủy kết bạn thành công.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Có lỗi xảy ra trong quá trình hủy kết bạn.",
      success: false,
      error: error.message,
    });
  }
};

//xem profile user / guest
export const getProfile = async(req,res,next)=>{
  const friendId = req.params.friendId || req.body.user.userId; // Nếu không có friendId, sử dụng userId của người dùng hiện tại
    try {
        // Lấy thông tin bạn bè
        const friend = await Users.findById(friendId).select('firstName lastName email avatar profession location verified');
        if (!friend) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }
        // Lấy danh sách bài đăng của bạn bè cùng với bình luận và lượt thích
        const posts = await Posts.find({ userId: friendId })
            .populate('likes', 'firstName lastName avatar') // Lấy thông tin người thích bài đăng
            .populate({ 
                path: 'comments', 
                populate: { path: 'userId', select: 'firstName lastName avatar' } // Lấy thông tin bình luận và người bình luận
            })
            .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo

        // Trả về thông tin người dùng và bài đăng
        res.status(200).json({ friend, posts });
    } catch (error) {
        console.error('Lỗi khi lấy thông tin profile:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin profile.' });
    }

}
// block / unblock
export const  handleBlock =async(req,res,next)=>{
  const targetUserId = req.params.userId; // ID của người dùng cần chặn/bỏ chặn
    const requesterId = req.body.user.userId; // ID của người dùng đang thực hiện yêu cầu
  try {
    // Tìm người dùng yêu cầu
    const requester = await Users.findById(requesterId);
    const targetUser = await Users.findById(targetUserId);

    if (!targetUser) {
        return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Khởi tạo mảng blocked nếu chưa tồn tại
    if (!requester.blocked) {
        requester.blocked = []; // Khởi tạo mảng trống
    }
    // Kiểm tra xem người dùng đã bị chặn chưa
    const isBlocked = requester.blocked.includes(targetUserId);

    if (isBlocked) {
        // Nếu đã bị chặn, bỏ chặn
        requester.blocked.pull(targetUserId);
        await requester.save();
        return res.status(200).json({ message: "Đã bỏ chặn người dùng." });
    } else {
        // Nếu chưa bị chặn, chặn người dùng
        requester.blocked.push(targetUserId);
        await requester.save();
        return res.status(200).json({ message: "Đã chặn người dùng." });
    }
} catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình chặn/bỏ chặn người dùng." });
}
}
//unfriend
export const unFriend =async(req,res,next)=>{
  try {
    const currentUserId = req.body.user.userId; // ID người thực hiện thao tác unfriend
    const friendId = req.params.friendId; // ID người bạn muốn hủy kết bạn
    // Tìm người dùng hiện tại
    const currentUser = await Users.findById(currentUserId);
    if (!currentUser) {
        return res.status(404).json({ message: 'Người dùng không tồn tại.' });
    }
    // Tìm người bạn muốn hủy kết bạn
    const friendToUnfriend = await Users.findById(friendId);
    if (!friendToUnfriend) {
        return res.status(404).json({ message: 'Người bạn này không tồn tại.' });
    }
    // Kiểm tra xem người đó có trong danh sách bạn bè không
    if (!currentUser.friends.includes(friendId)) {
        return res.status(400).json({ message: 'Người này không phải bạn của bạn.' });
    }
    // Xóa bạn bè trong danh sách bạn bè của người dùng hiện tại
    currentUser.friends = currentUser.friends.filter(friend => friend.toString() !== friendId);
    // Xóa người dùng hiện tại khỏi danh sách bạn bè của người kia
    friendToUnfriend.friends = friendToUnfriend.friends.filter(friend => friend.toString() !== currentUserId);
    // Lưu thay đổi
    await currentUser.save();
    await friendToUnfriend.save();
    return res.status(200).json({ message: 'Đã hủy kết bạn thành công.' });
} catch (error) {
    console.error('Lỗi khi hủy kết bạn:', error);
    return res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại sau.' });
}
}
//follow or unfollow
export const toggleFollow = async (req,res,next)=>{
  
  console.log("togleFollow")
  const userId = req.params.userId; // ID người dùng cần theo dõi/bỏ theo dõi
  const followerId = req.body.user.userId ; // ID của người dùng đang theo dõi
 // Kiểm tra và in ra các giá trị quan trọng
 console.log('req.params:', req.params); // In ra toàn bộ params
 console.log('userId:', userId); // Kiểm tra giá trị của userId
 console.log('followerId:', followerId); // Kiểm tra giá trị của followerId
  // Kiểm tra xem người dùng có đang cố gắng theo dõi chính mình không
  if (userId === followerId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
  }
  
  try {
      // Tìm người dùng theo userId và followerId trong cơ sở dữ liệu
      const user = await Users.findById(userId);
      const follower = await Users.findById(followerId);
      console.log(user)
      console.log(follower)
       
      // Kiểm tra xem cả hai người dùng có tồn tại hay không
      if (!user || !follower) {
          return res.status(404).json({ message: 'User not found' });
      }
      if (!Array.isArray(user.followers)|| !Array.isArray(follower.followers)) {
        user.followers = [];
        user.followers = [];
    }

      // Kiểm tra xem followerId có nằm trong danh sách followers của user không
      const isFollowing = user.followers.includes(followerId);

      if (isFollowing) {
          // Nếu đã theo dõi, thực hiện bỏ theo dõi
          user.followers = user.followers.filter(id => id.toString() !== followerId); // Bỏ followerId khỏi danh sách followers
          follower.following = follower.following.filter(id => id.toString() !== userId); // Bỏ userId khỏi danh sách following
          await user.save(); // Lưu thay đổi cho người dùng
          await follower.save(); // Lưu thay đổi cho người theo dõi
          return res.status(200).json({ message: 'Unfollowed successfully' }); // Trả về thông báo
      } else {
          // Nếu chưa theo dõi, thực hiện theo dõi
          user.followers.push(followerId); // Thêm followerId vào danh sách followers
          follower.following.push(userId); // Thêm userId vào danh sách following
          await user.save(); // Lưu thay đổi cho người dùng
          await follower.save(); // Lưu thay đổi cho người theo dõi
          return res.status(200).json({ message: 'Now following' }); // Trả về thông báo
      }
  } catch (error) {
      res.status(500).json({ message: error.message }); // Xử lý lỗi nếu có
  }
}


export const respondToFriendRequest = async (req, res, next) => {
  try {
    const requesterId = req.body.user.userId; 
    const { requestId, requestStatus } = req.body; 
    const friendRequest = await FriendsRequest.findById(requestId);
    
    if (!friendRequest) {
      return next("No Friend Request Found."); 
    }

    // Cập nhật trạng thái yêu cầu kết bạn
    const updatedRequest = await FriendsRequest.findOneAndUpdate(
      { _id: requestId },
      { requestStatus },
      { new: true }
    );

    // Kiểm tra xem người dùng có đang cố gắng thêm chính họ không
    if (friendRequest.requestFrom === requesterId) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể thêm chính mình vào danh sách bạn bè.",
      });
    }

    // Xử lý yêu cầu chấp nhận bạn bè
    if (requestStatus === "Accepted") {
      const [user, friend] = await Promise.all([
        Users.findById(requesterId),           // Người nhận yêu cầu
        Users.findById(friendRequest.requestFrom), // Người gửi yêu cầu
      ]);

      // Thêm bạn bè vào danh sách của người nhận yêu cầu
      if (!friend.friends.includes(friendRequest.requestTo)) {
        friend.friends.push(friendRequest.requestTo); 
        console.log("friend",friend)
      }
      // Thêm người nhận yêu cầu vào danh sách bạn bè của người gửi yêu cầu
      if (!user.friends.includes(friendRequest.requestFrom)) {
        user.friends.push(friendRequest.requestFrom);
        console.log("user",user)
      }
      
      await Promise.all([user.save(), friend.save()]); 
    } else {
      // Nếu không chấp nhận, xóa yêu cầu
      await FriendsRequest.findByIdAndDelete(requestId);
    }

    res.status(200).json({
      success: true,
      message: `Friend Request ${requestStatus}`, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Authentication error",
      success: false,
      error: error.message,
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { userId, token } = req.params;
  try {
    const verificationResult = await Verification.findOne({ userId });
    if (verificationResult) {
      const { expiresAt, token: hashedToken } = verificationResult;
      if (expiresAt < Date.now()) {
        console.log("Token has expired");
        await Verification.findOneAndDelete({ userId });
        await Users.findOneAndDelete({ _id: userId });
        const message = "Verification token has expired";
        return res.status(200).json({ status: "error", message, redirectTo: "/error" });
      } else {
        const isMatch = await compareString(token, hashedToken);
        if (isMatch) {
          console.log("Token is a match");
          await Users.findOneAndUpdate({ _id: userId }, { verified: true });
          await Verification.findOneAndDelete({ userId });
          const message = "Email verified successfully";
          return res.status(200).json({ status: "success", message, redirectTo: "/login" });
        } else {
          const message = "Verification failed or link is invalid";
          return res.status(200).json({ status: "error", message, redirectTo: "/error" });
        }
      }
    } else {
      const message = "Invalid verification link. Try again later";
      return res.status(200).json({ status: "error", message, redirectTo: "/error" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body; // Lấy email từ yêu cầu.
    const user = await Users.findOne({ email }); // Tìm người dùng theo email.
    if (!user) {
      return res.status(404).json({ status: "FAILED", message: "Email address not found" });
    }
    const existingRequest = await passwordReset.findOne({ email }); // Kiểm tra yêu cầu đặt lại mật khẩu đã tồn tại.
    if (existingRequest) {
      if (existingRequest.expiresAt > Date.now()) {
        return res.status(201).json({ status: "PENDING", message: "Reset password link has already been sent to your email" });
      }
      await passwordReset.deleteOne({ email }); // Xóa yêu cầu cũ nếu đã hết hạn.
    }
    await resetPasswordLink(user, res); // Gửi email với liên kết đặt lại mật khẩu.
  } catch (error) {
    console.error(error); 
    res.status(500).json({ message: "Internal server error." }); // Trả về lỗi 500 nếu có lỗi trong quá trình xử lý.
  }
};

export const resetPassword = async (req, res) => {
  const { userId, token } = req.params; // Lấy userId và token từ tham số URL.
  
  try {
    const user = await Users.findById(userId); // Tìm người dùng theo ID.
    if (!user) return res.status(404).json({ success: "FAILED", message: "Invalid password reset link. Try again" });
    const resetPasswordRequest = await passwordReset.findOne({ userId }); // Tìm yêu cầu đặt lại mật khẩu.
    if (!resetPasswordRequest || resetPasswordRequest.expiresAt < Date.now()) {
      return res.status(404).json({ success: "FAILED", message: "Invalid or expired password reset link. Try again" });
    }
    const isMatch = await compareString(token, resetPasswordRequest.token); // So sánh token với token trong yêu cầu.
    if (!isMatch) {
      return res.status(404).json({ success: "FAILED", message: "Invalid reset password link. Please try again" });
    }
    res.status(200).json({ success: "success" }); // Nếu mọi thứ hợp lệ, trả về thành công.
  } catch (error) {
    console.error(error); // Ghi lại lỗi.
    res.status(500).json({ message: "Internal server error." }); // Trả về lỗi 500 nếu có lỗi trong quá trình xử lý.
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId, password } = req.body; // Lấy userId và password từ yêu cầu.
    const hashedPassword = await hashString(password); // Mã hóa mật khẩu mới.

    const user = await Users.findByIdAndUpdate(userId, { password: hashedPassword }); // Cập nhật mật khẩu trong cơ sở dữ liệu.
    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found" }); // Nếu người dùng không tồn tại, trả về lỗi.
    }

    await passwordReset.deleteOne({ userId }); // Xóa yêu cầu đặt lại mật khẩu sau khi cập nhật thành công.
    res.status(200).json({ success: true, message: "Password successfully reset" }); // Trả về phản hồi thành công.
  } catch (error) {
    console.error(error); // Ghi lại lỗi.
    res.status(500).json({ status: "error", message: error.message }); // Trả về lỗi 500 nếu có lỗi trong quá trình xử lý.
  }
};
export const friendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    console.log(`friendrequest: userID:${userId}`);
    const { recipientId } = req.body;
    const friendRequestData = {
      requestTo: recipientId,
      requestFrom: userId,
    };
    const existingRequest = await FriendsRequest.findOne(friendRequestData);
    console.log("existingRequest ");
    console.log(existingRequest);
    if (existingRequest) {
      next("Friend request already sent.");
      return;
    }
    const newFriendRequest = await FriendsRequest.create(friendRequestData);
    res.status(201).json({
      success: true,
      message: "Friend request successfully",
      newFriendRequest
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};

export const getFriendRequest = async (req, res, next) => {
  try {
    const { userId } = req.body.user;
    console.log(userId)
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }
    const requests = await FriendsRequest.find({
      requestTo: userId,
      requestStatus: "Pending",
    })
      .populate({
        path: "requestFrom",
        select: "-password", 
      })
      .sort({ _id: -1 });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error); 
    return res.status(500).json({
      success: false,
      message: "Internal server error", 
      error: error.message,
    });
  }
};
export const getUser = async (req, res, next) => {
  try {
    const { userId } = req.body.user; 
    const { userId: targetUserId } = req.params; 
    const user = await Users.findById(targetUserId ?? userId).populate({
      path: "friends",
      select: "-password",
    });
    if (!user) {
      return res.status(200).send({
        message: "User Not Found",
        success: false,
      });
    }
    user.password = undefined; 
    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "auth error",
      success: false,
      error: error.message,
    });
  }
};
export const updateUser = async (req, res) => {
    const { userId } = req.body.user;
    const updates = req.body; 
    const allowedUpdates = ['firstName', 'lastName', 'email', 'location', 'profileUrl', 'profession', 'workplace', 'birthDate'];
    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        Object.keys(updates).forEach((key) => {
            if (allowedUpdates.includes(key)) {
                user[key] = updates[key];
            }
        });
        await user.save();
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user
        });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
