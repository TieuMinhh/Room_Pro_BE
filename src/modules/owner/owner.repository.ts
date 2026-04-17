import OwnerModel from './owner.model';
import AccountModel from '../account/account.model';

export const ownerRepository = {
  findAll: async () => {
    return await AccountModel.find({ role: 'owner', _destroy: false }).populate('profile');
  },

  updateProfile: async (accountId: string, data: any) => {
    return await OwnerModel.findOneAndUpdate({ id_account: accountId }, data, { new: true });
  },

  findByAccountId: async (accountId: string) => {
    return await OwnerModel.findOne({ id_account: accountId });
  }
};
