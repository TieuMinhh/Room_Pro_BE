import AccountModel, { IAccount } from '../account/account.model';
import TenantModel from './tenant.model';

export const tenantRepository = {
  findAll: async (): Promise<IAccount[]> => {
    return await AccountModel.find({ role: 'tenant', _destroy: false }).populate('profile');
  },

  findOneByEmail: async (email: string): Promise<IAccount | null> => {
    return await AccountModel.findOne({ email, role: 'tenant', _destroy: false }).populate('profile');
  },

  findById: async (id: string): Promise<IAccount | null> => {
    return await AccountModel.findById(id).populate('profile');
  },

  findOneActiveById: async (id: string): Promise<IAccount | null> => {
    return await AccountModel.findOne({ _id: id, role: 'tenant', _destroy: false }).populate('profile');
  },

  updateProfile: async (accountId: string, data: any): Promise<any> => {
    return await TenantModel.findOneAndUpdate({ id_account: accountId }, data, { new: true });
  }
};
