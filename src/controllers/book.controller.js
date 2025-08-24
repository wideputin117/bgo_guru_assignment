import Book from "../models/Book.js";
import ApiError from "../utils/error/ApiError.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";
import { applyPagination } from "../utils/pagination.js";

export const create_book = asyncHandler(async(req,res,next)=>{
    const id = req.user._id
    const { title, author, publishedYear, genre, createdBy } = req.body
    console.log("the id is",id)
    if(!title || !author || !publishedYear || !genre){
        return next(new ApiError("Bad data",400))
    }
    const payload={
        title:title,
        author:author,
        publishedYear:publishedYear,
        genre:genre,
        createdBy:id
    }

    const data = await Book.create(payload)
    if(!data){
        return next(new ApiError("Unable to create the book",500))
    }
    return res.status(201).json({message:"Book Created successfully",data:data,success:true})
})


export const get_books = asyncHandler(async(req, res , next)=>{
    const {search} = req.query
    const { page, skip, limit } = applyPagination(req.query)
    const filter ={}

    if(search){
         filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { author: { $regex: search, $options: "i" } }
        ];
    }
    const totalDocuments = await Book.countDocuments(filter)
    const book_data = await Book.find(filter).skip(skip).limit(limit).lean()
    if(!book_data){
        return next(new ApiError("Server Error in fetching the data",500))
    }
    const pagination = {
        total:totalDocuments,
        totalPages:Math.ceil(totalDocuments/limit),
        limit:limit,
        page:page
    }
    return res.status(200).json({message:"Books Retrived successfully",data:book_data,pagination:pagination,success:true})

})

export const delete_book = asyncHandler(async (req, res, next) => {
    const user = req?.user;
    const userId = user?._id;
    const role = user?.role;
    const bookId = req?.params?.bookId;
    
    if (!bookId) {
        return next(new ApiError("No bookId provided in params", 400));
    }

     const book = await Book.findById(bookId);
    if (!book) {
        return next(new ApiError("Book not found", 404));
    }
    console.log("the user id", userId,book) 
     if (role !== "ADMIN" && book.createdBy.toString() !== userId.toString()) {
        return next(new ApiError("Not authorized to delete this book", 403));
    }

     await Book.findByIdAndDelete(bookId);

    return res.status(200).json({
        success: true,
        message: "Book deleted successfully"
    });
});



export const update_book = asyncHandler(async (req, res, next) => {
    const user = req?.user;
    const userId = user?._id;
    const role = user?.role;
    const bookId = req?.params?.bookId;
    const { title, author, publishedYear, genre } = req.body;

    if (!bookId) {
        return next(new ApiError("No bookId provided in params", 400));
    }

    const book = await Book.findById(bookId);
    if (!book) {
        return next(new ApiError("Book not found", 404));
    }
        if (role !== "ADMIN" && book.createdBy.toString() !== userId.toString()) {
        return next(new ApiError("Not authorized to update this book", 403));
    }

       if (title) book.title = title;
    if (author) book.author = author;
     if (publishedYear) book.publishedYear = publishedYear;
    if (genre) book.genre = genre;

    const updatedBook = await book.save();

    return res.status(200).json({
        success: true,
        message: "Book updated successfully",
        data: updatedBook
    });
});
