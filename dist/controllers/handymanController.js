"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addReview = exports.getHandymanById = exports.createHandyman = exports.getHandymen = void 0;
const Handyman_js_1 = __importDefault(require("../models/Handyman.js"));
const Review_js_1 = __importDefault(require("../models/Review.js"));
const getHandymen = async (req, res) => {
    try {
        const { expertise, location, search } = req.query;
        let query = {};
        if (expertise)
            query.expertise = expertise;
        if (location)
            query.location = location;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { expertise: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }
        const handymen = await Handyman_js_1.default.find(query).sort({ rating: -1 });
        res.json(handymen);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching handymen' });
    }
};
exports.getHandymen = getHandymen;
const createHandyman = async (req, res) => {
    try {
        const handyman = new Handyman_js_1.default(req.body);
        await handyman.save();
        res.status(201).json(handyman);
    }
    catch (error) {
        console.error('Handyman creation error:', error);
        res.status(500).json({ message: 'Error creating handyman' });
    }
};
exports.createHandyman = createHandyman;
const getHandymanById = async (req, res) => {
    try {
        const handyman = await Handyman_js_1.default.findById(req.params.id);
        if (!handyman) {
            return res.status(404).json({ message: 'Handyman not found' });
        }
        const reviews = await Review_js_1.default.find({ handymanId: handyman._id }).populate('userId', 'name');
        res.json({ handyman, reviews });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch handyman profile' });
    }
};
exports.getHandymanById = getHandymanById;
const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const handymanId = req.params.id;
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const review = new Review_js_1.default({
            handymanId,
            userId,
            rating,
            comment,
        });
        await review.save();
        // Update handyman rating and reviews count
        const reviews = await Review_js_1.default.find({ handymanId });
        const reviewsCount = reviews.length;
        const avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewsCount;
        await Handyman_js_1.default.findByIdAndUpdate(handymanId, {
            rating: avgRating,
            reviewsCount,
        });
        res.status(201).json(review);
    }
    catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: 'Failed to add review' });
    }
};
exports.addReview = addReview;
