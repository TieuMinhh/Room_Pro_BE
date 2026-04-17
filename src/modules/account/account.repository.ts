import AccountModel, { IAccount } from "./account.model";

export const accountRepository = {
  findByEmail: async (email: string): Promise<IAccount | null> => {
    return await AccountModel.findOne({ email, _destroy: false }).populate('profile');
  },

  findById: async (id: string): Promise<IAccount | null> => {
    return await AccountModel.findById(id).populate('profile');
  },

  create: async (data: Partial<IAccount>): Promise<IAccount> => {
    return await AccountModel.create(data);
  },

  update: async (id: string, data: Partial<IAccount>): Promise<IAccount | null> => {
    return await AccountModel.findByIdAndUpdate(id, data, { new: true });
  }
};
