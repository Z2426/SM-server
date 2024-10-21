import mongoose, { Schema } from "mongoose";

const notificationSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true }, // Người nhận thông báo
    type: { type: String, required: true }, /* Loại thông báo (
        'friend_request',
        'friend_request_accepted',
        'comment',
        'like
        'post_follow',
        'follow',
 ) */
    message: { type: String, required: true }, // Nội dung thông báo
    related_id: { type: mongoose.Schema.Types.ObjectId }, // ID liên quan (ví dụ ID bài viết, bình luận hoặc người gửi lời mời ,like)
    created_at: { type: Date, default: Date.now },
    is_read: { type: Boolean, default: false },
    avatar: { type: String }, // Avatar của người liên quan
    redirect_url: { type: String } // URL để chuyển người dùng đến nội dung liên quan
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
