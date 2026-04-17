import DepartmentModel, { IDepartment } from './department.model';

export const departmentRepository = {
  create: async (data: Partial<IDepartment>): Promise<IDepartment> => {
    return await DepartmentModel.create(data);
  },

  findByOwnerId: async (ownerId: string): Promise<IDepartment[]> => {
    return await DepartmentModel.find({ ownerId, _destroy: false });
  },

  findById: async (id: string): Promise<IDepartment | null> => {
    return await DepartmentModel.findById(id);
  },

  findByIdActive: async (id: string): Promise<IDepartment | null> => {
    const department = await DepartmentModel.findById(id);
    if (!department || department._destroy) return null;
    return department;
  },

  updateById: async (id: string, data: Partial<IDepartment>): Promise<IDepartment | null> => {
    return await DepartmentModel.findByIdAndUpdate(id, data, { new: true });
  },

  softDelete: async (id: string): Promise<IDepartment | null> => {
    return await DepartmentModel.findByIdAndUpdate(id, { _destroy: true }, { new: true });
  }
};
