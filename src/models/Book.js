import mongoose from "mongoose";

const book_schema = new mongoose.Schema({
    title:{type:String, required:true,index:true},
    author:{type:String, required:true,  index:true},
    publishedYear:{type:Number},
    genre:{ type:String,index:true},
    createdBy:{
        type:mongoose.Types.ObjectId,
        ref:'User'
     }
},{
    timestamps:true
})

const Book = mongoose.model("Book",book_schema)
export default Book