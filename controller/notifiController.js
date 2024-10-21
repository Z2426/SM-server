// import Users from "../models/userModel";
// import Notification from "../models/notificaionModel";
// const notificationUrls = {
//     friend_request: (senderId) => `/profile/${senderId}`, // Trang cá nhân của người gửi yêu cầu kết bạn
//     friend_request_accepted: (senderId) => `/profile/${senderId}`, // Trang cá nhân của người chấp nhận kết bạn
//     comment: (relatedId) => `/post/${relatedId}#comment`, // Bài viết và cuộn đến phần bình luận
//     like: (relatedId) => `/post/${relatedId}`, // Bài viết được like
//     post_follow: (relatedId) => `/post/${relatedId}`, // Bài viết được theo dõi
//     follow: (senderId) => `/profile/${senderId}`, // Trang cá nhân của người theo dõi
// };

// const createNotification = async (senderId, receiverId, messageType, relatedId) => {
//     try {
//         // Lấy thông tin người gửi và người nhận
//         const sender = await Users.findById(senderId).select('firstName lastName avatar');
//         const receiver = await Users.findById(receiverId).select('firstName lastName avatar');

//         if (!receiver) {
//             throw new Error('Người nhận không tồn tại');
//         }

//         // Tạo thông điệp tùy theo loại thông báo
//         let message = '';
//         switch (messageType) {
//             case 'friend_request':
//                 message = `${sender.firstName} ${sender.lastName} đã gửi yêu cầu kết bạn.`;
//                 break;
//             case 'friend_request_accepted':
//                 message = `${sender.firstName} ${sender.lastName} đã chấp nhận yêu cầu kết bạn của bạn.`;
//                 break;
//             case 'comment':
//                 message = `${sender.firstName} ${sender.lastName} đã bình luận trên bài viết của bạn.`;
//                 break;
//             case 'like':
//                 message = `${sender.firstName} ${sender.lastName} đã thích bài viết của bạn.`;
//                 break;
//             case 'post_follow':
//                 message = `${sender.firstName} ${sender.lastName} đang theo dõi bài viết của bạn.`;
//                 break;
//             case 'follow':
//                 message = `${sender.firstName} ${sender.lastName} đã theo dõi bạn.`;
//                 break;
//             default:
//                 throw new Error('Loại thông báo không hợp lệ');
//         }

//         // Tạo URL chuyển hướng dựa trên loại thông báo và thông tin liên quan
//         const redirectUrl = notificationUrls[messageType](relatedId || senderId);

//         // Tạo thông báo
//         const notification = {
//             user_id: receiverId, // Người nhận thông báo
//             type: messageType,
//             message: message,
//             related_id: senderId, // ID của người gửi
//             avatar: sender.avatar, // Avatar của người gửi
//             redirect_url: redirectUrl, // URL chuyển hướng
//             created_at: Date.now(),
//             is_read: false,
//         };

//         // Lưu thông báo vào cơ sở dữ liệu
//         await Notification.create(notification);
//         console.log('Thông báo đã được tạo thành công:', notification);
//     } catch (error) {
//         console.error('Lỗi khi tạo thông báo:', error.message);
//     }
// };

// // Sự kiện yêu cầu kết bạn
// export const sendFriendRequestNotification = async (senderId, receiverId) => {
//     await createNotification(senderId, receiverId, 'friend_request');
// };

// // Sự kiện chấp nhận yêu cầu kết bạn
// export const acceptFriendRequestNotification = async (senderId, receiverId) => {
//     await createNotification(senderId, receiverId, 'friend_request_accepted');
// };

// // Sự kiện bình luận
// export const commentNotification = async (senderId, receiverId) => {
//     await createNotification(senderId, receiverId, 'comment');
// };

// // Sự kiện thích bài viết
// export const likeNotification = async (senderId, receiverId) => {
//     await createNotification(senderId, receiverId, 'like');
// };

// // Sự kiện theo dõi bài viết
// export const postFollowNotification = async (senderId, receiverId) => {
//     await createNotification(senderId, receiverId, 'post_follow');
// };

// // Sự kiện theo dõi người dùng
// export const followNotification = async (senderId, receiverId) => {
//     await createNotification(senderId, receiverId, 'follow');
// };


