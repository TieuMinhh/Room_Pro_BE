import { pick } from "lodash";

export const pickUser = (user: any): any => {
    if (!user) return {};
    return pick(user, [
        '_id', 'email', 'userName', 'displayName', 'avatar', 
        'role', 'isActive', 'address', 'phone', 'timeExpired', 
        'dateOfBirth', 'CCCD', "signature", 'createdAt', 'updatedAt'
    ]);
};

export function generateOTPs(count: number = 5, length: number = 6): string[] {
    const otps: string[] = [];
    for (let i = 0; i < count; i++) {
        let otp = '';
        for (let j = 0; j < length; j++) {
            otp += Math.floor(Math.random() * 10).toString();
        }
        otps.push(otp);
    }
    return otps;
}
