import AdminModel from './admin.model';
import AccountModel from '../account/account.model';

export const adminRepository = {
  findAll: async () => {
    return await AccountModel.find({ 
      role: 'owner' 
    }).populate('profile');
  },

  updateProfile: async (accountId: string, data: any) => {
    return await AdminModel.findOneAndUpdate({ id_account: accountId }, data, { new: true });
  }
};
