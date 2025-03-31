import dbConnect from '@/lib/dbConnect';
import userModel from '@/model/User';
import { z } from 'zod';
import { username } from '@/schemas/signUpSchema';

const UsernameQuerySchema = z.object({
  username: username,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);

    const queryParams = {
      username: searchParams.get('username'),
    };

    const result = UsernameQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(', ')
              : 'Invalid query parameters',
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingUser = await userModel.findOne({ username });

    if (!existingUser) {
      return Response.json(
        {
          success: false,
          message: 'User does not exist',
        },
        { status: 404 }
      );
    }

    if (!existingUser.isAcceptingMessages) {
      return Response.json(
        {
          success: false,
          message: 'User is not accepting messages now'
        },
        { status: 403 }
      );
    }
    
    return Response.json(
      {
        success: true,
        message: 'User is accepting messages'
      }
    );
    
  } catch (error) {
    console.error('Error checking username and accepting message status:', error);
    return Response.json(
      {
        success: false,
        message: 'Error checking username and accepting message status',
      },
      { status: 500 }
    );
  }
}