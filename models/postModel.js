import mongoose, { Schema } from "mongoose";
const postSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "Users", required: true }, 
    description: { type: String, required: true },  
    image: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: "Users" }],  
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    visibility: {
      type: String,
      enum: ['public', 'friends', 'onlyme', 'specific', 'draft'],
      default: 'public'  
    },
    specifiedUsers: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    viewers: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    views: { type: Number, default: 0 }},
  { timestamps: true }
);
const Posts = mongoose.model("Posts", postSchema);
export default Posts;
