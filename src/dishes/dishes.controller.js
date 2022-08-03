const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// function list
function list(req, res, next){
    res.json({data:dishes});
}

// function read
function read(req, res){
    res.json({data: res.locals.dish})
}

// function create
function create(req, res, next){
    let newId = nextId();
    const newDish = {
        id: newId,
        ...res.locals.newDish
    };
    dishes.push(newDish);
    res.status(201).json({data: newDish});
}

//middleware for create
    // function hasName
function hasName(req, res, next){
    const {data: dish} = req.body;
    if(!dish.name || dish.name===""){
        return next({
            status: 400,
            message: "Dish must include a name"
        })
    }
    res.locals.dishValidation = dish;
    next();
}

    // function hasDescription 
function hasDescription(req, res, next){
    const dish = res.locals.dishValidation;
    if(!dish.description || dish.description===""){
        return next({
            status: 400,
            message: "Dish must include a description"
        })
    }
    next();
}

    // function hasPrice 
        //check if there if price doesn't exist
        //if exists - check if its = or below 0 || if the price is a number
function hasPrice(req, res, next){
    const dish = res.locals.dishValidation;
    if(!dish.price){
        return next({
            status: 400,
            message: "Dish must include a price"
        })
    } 
    else if (dish.price <= 0 || typeof dish.price !== "number"){
        return next({
            status: 400,
            message: "Dish must have a price that is an integer greater than 0"
        })
    }
    next();    
}


    //function hadImage
function hasImage(req, res, next){
    const dish = res.locals.dishValidation;
    if(!dish.image_url || dish.image_url===""){
        return next({
            status: 400,
            message: "Dish must include a image_url"
        })
    }
    next();
}

    // function didExists
function dishExists(req, res, next){
    const dishId = req.params.dishId;
    const foundDish = dishes.find((dish) => dish.id === dishId);
        if(foundDish){
            res.locals.dish = foundDish;
            return next();
        }
        return next({
            status: 404,
            message: `Dish does not exist: ${req.params.dishId}`
        })
}

    // function postPropertiesAreValid
function postPropertiesAreValid(req, res, next){
    res.locals.newDish = res.locals.dishValidation;
    next();
}

    // function update
function update(req, res, next) {
    const foundDish = res.locals.dish;
    const { data: { name, description, price, image_url } = {} } = req.body;
    foundDish.name = name;
    foundDish.description = description;
        if (typeof price == "number") {
            foundDish.price = price;
        } else {
            next({
                status: 400,
                message: `Price is not a number!`,
            });
        }
        foundDish.image_url = image_url;
        res.json({ data: res.locals.dish });
    }
    // function updateValidation
function updateValidation(req, res, next) {
    const { dishId } = req.params;
    const newDish = res.locals.newDish;
    const { data: { id }} = req.body;
        if (id) {
            return newDish.id == dishId ? next(): next({
                status: 400,
                message: `Dish id does not match route id. Dish: ${newDish.id}, Route: ${dishId}`,
            });
        }
        newDish.id = dishId;
        res.locals.newDish = { ...newDish };
        next();
    }

module.exports = {
    list,
    read: [dishExists, read],
    create: [
        hasName,
        hasDescription,
        hasPrice,
        hasImage,
        postPropertiesAreValid,
        create,
        ],
    update: [
        dishExists,
        hasName,
        hasDescription,
        hasPrice,
        hasImage,
        postPropertiesAreValid,
        updateValidation,
        update,
        ],
    };


