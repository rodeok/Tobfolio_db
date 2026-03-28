import { Response, Request } from 'express';
import Handyman from '../models/Handyman.js';
import Review from '../models/Review.js';

interface AuthRequest extends Request {
    user?: {
        userId: string;
    };
}

export const getHandymen = async (req: Request, res: Response) => {
    try {
        const { expertise, location, search } = req.query;
        let query: any = {};

        if (expertise) query.expertise = expertise;
        if (location) query.location = location;
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { expertise: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const handymen = await Handyman.find(query).sort({ rating: -1 });
        res.json(handymen);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching handymen' });
    }
};

export const createHandyman = async (req: AuthRequest, res: Response) => {
    try {
        const handyman = new Handyman(req.body);
        await handyman.save();
        res.status(201).json(handyman);
    } catch (error) {
        console.error('Handyman creation error:', error);
        res.status(500).json({ message: 'Error creating handyman' });
    }
};

export const getHandymanById = async (req: Request, res: Response) => {
    try {
        const handyman = await Handyman.findById(req.params.id);
        if (!handyman) {
            return res.status(404).json({ message: 'Handyman not found' });
        }

        const reviews = await Review.find({ handymanId: handyman._id }).populate('userId', 'name');
        
        res.json({ handyman, reviews });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch handyman profile' });
    }
};

export const addReview = async (req: AuthRequest, res: Response) => {
    try {
        const { rating, comment } = req.body;
        const handymanId = req.params.id;
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const review = new Review({
            handymanId,
            userId,
            rating,
            comment,
        });

        await review.save();

        // Update handyman rating and reviews count
        const reviews = await Review.find({ handymanId });
        const reviewsCount = reviews.length;
        const avgRating = reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewsCount;

        await Handyman.findByIdAndUpdate(handymanId, {
            rating: avgRating,
            reviewsCount,
        });

        res.status(201).json(review);
    } catch (error) {
        console.error('Add review error:', error);
        res.status(500).json({ message: 'Failed to add review' });
    }
};
