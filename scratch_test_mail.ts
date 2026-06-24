import { send_forgot_otr_mail } from './src/helper/mail';

const test = async () => {
    try {
        const mockUser = {
            email: 'pramit6515@gmail.com',
            fullName: 'Test Student',
            phoneNumber: '+919876543210'
        };
        const res = await send_forgot_otr_mail(mockUser, '87654321');
        console.log("Forgot OTR Email retrieval test result:", res);
    } catch (e) {
        console.error("Error in forgot OTR mail retrieval test:", e);
    }
};

test();
