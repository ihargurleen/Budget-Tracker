import { Category } from "../modal/category.schema.js";

export const createCategory = async (req, res, next ) => {
    try{
        const { category } = req.body;
        if(!category){
            return res.status(400).json({
                message: "category is required"
            })
        };
    const data = await Category.create({
            category,
    });
    return res.status(201).json({
        message:" category created successfully",
        data:{
            _id:data._id,
            category: data.category,
        },
    });
}     catch(err){
        return res.status(500).json({
            message : err.message
        });
    }
};

export const getCategory = async (req, res, next ) => {
    try{
        const data = await Category.find();
        if(data.length ===0 ){
            return res.status(400).json({
                message: "category not found"
            });
        }
        return res.status(201).json({
            data,
        });
    }catch(err){
        return res.status(500).json({
            message: err.message
        });
    }
};