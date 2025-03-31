import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import { User } from 'next-auth'
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";

export async function DELETE(
  request: Request
) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const _user = session?.user as User | undefined

    if (!session || !_user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }
    const { searchParams } = new URL(request.url); // Ensure a valid base URL
    const paramId = searchParams.get('messageId');

    if (!paramId || !mongoose.Types.ObjectId.isValid(paramId)) {
        return Response.json(
            { message: 'Message Id not found or already deleted', success: false },
            { status: 404 }
        )
    }

    const messageId = new mongoose.Types.ObjectId(paramId);
    


    try {
        const updateResult = await userModel.updateOne(
            { _id: _user._id },
            { $pull: { messages: { _id: messageId } } }
        );

        if (updateResult.modifiedCount === 0) {
            return Response.json(
                { message: 'Message not found or already deleted', success: false },
                { status: 404 }
            )
        }

        return Response.json(
            { message: 'Message deleted', success: true },
            { status: 200 }
        );
    }
    catch (error) {
        console.error('Error deleting message:', error);
        return Response.json(
            { message: 'Error deleting message', success: false },
            { status: 500 }
        );
    }
}