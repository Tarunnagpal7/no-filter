import { resend } from "@/lib/resend";
import VerificationEmail from "@/template/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(email : string,
    username: string, 
    verifyCode: string
   ): Promise<ApiResponse> {

    try{
        console.log(process.env.EMAIL_FROM)
        const reponse = await resend.emails.send({
            from:  'Acme <onboarding@resend.dev>' ,//( process.env.EMAIL_FROM as string), 
            to : email,
            subject : 'NoFilter Vefication Code',
            react : VerificationEmail({username, otp: verifyCode})
        });

        console.log(reponse)

        return {
            success : true,
            message : "Verification email sent successfully",
        }

    }catch(err){
        console.error(err);
        return {
            success : false,
            message : "Failed to send verification email",
        }
    }

}