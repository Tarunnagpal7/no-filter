import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import { User } from 'next-auth'
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";

export async function GET() {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const _user = session?.user as User | undefined;

    if (!session || !_user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }
    const userId = new mongoose.Types.ObjectId(_user._id);
    try {
        const user = await userModel.aggregate([
            { $match: { _id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } },
        ]).exec();

        if (!user || user.length === 0) {
            return Response.json(
                { message: 'No messages', success: false },
                { status: 404 }
            );
        }

        return Response.json(
            { messages: user[0].messages },
            {
                status: 200,
            }
        );


    } catch (err) {
        console.error('An unexpected error occurred:', err);
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}