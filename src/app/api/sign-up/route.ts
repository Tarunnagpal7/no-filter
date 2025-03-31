import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request : Request) {
   await dbConnect();

   try{
     const {username , email , password} = await request.json();
      
     const existingVerificationUser = await userModel.findOne({
        username,
        isVerified: true
     })

        if(existingVerificationUser){
            return Response.json(
                {
                    success : false,
                     message : "Username already exists",
                },{
                    status : 400
                }
            );
        }

        const existingUser = await userModel.findOne({
            email
        });

        let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if(existingUser){
            if(existingUser.isVerified){
                return Response.json(
                    {
                        success : false,
                         message : "Email already exists",
                    },{
                        status : 400
                    }
                );
            }else{
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUser.password = hashedPassword;
                existingUser.verifyCode = verifyCode;
                existingUser.verifyCodeExpire = new Date(Date.now() + 3600000);
                await existingUser.save();
            }
       }else{

        const existingUsername = await userModel.findOne({
            username
        });

        if(existingUsername){
            await userModel.findOneAndDelete({
                username
            })
        }



         const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new userModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpire: new Date(Date.now() + 3600000),
                isVerified: false,
                isAcceptingMessages: true,
                messages : []
            });
            await newUser.save();
       }

       // send verification email
         const emailResponse  = await sendVerificationEmail(email, 
            username, 
            verifyCode
        );

        if(!emailResponse.success){
            return Response.json(
                {
                    success : false,
                     message : emailResponse.message,
                },{
                    status : 500
                }
            );
        }

        return Response.json(
            {
                success : true,
                message : "User registered successfully, please verify your account",
            },{
                status : 200
            }
        )

   }catch(err){
        console.error( 'Error while registering ',err);
        return Response.json(
            {
                success : false,
                message : "Internal server error",
            },{
                status : 500
            }
        )
   }

}


