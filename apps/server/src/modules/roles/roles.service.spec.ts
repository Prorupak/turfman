import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { Role } from './roles.schema';

describe('RolesService', () => {
  let service: RolesService;
  let roleModel: any;

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  const mockRoleModel = {
    create: jest.fn(), // Mock the create method
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    startSession: jest.fn().mockResolvedValue(mockSession), // Return the mocked session object
    updateMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: getModelToken(Role.name),
          useValue: mockRoleModel,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    roleModel = module.get(getModelToken(Role.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a list of roles', async () => {
      const mockRoles = [
        {
          name: 'Admin',
          sort: 1,
          default: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          id: '1',
        },
        {
          name: 'User',
          sort: 2,
          default: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          id: '2',
        },
      ];
      roleModel.exec.mockResolvedValue(mockRoles);

      const result = await service.findAll();
      expect(result).toEqual([
        {
          name: 'Admin',
          sort: 1,
          default: false,
          createdAt: mockRoles[0].createdAt,
          updatedAt: mockRoles[0].updatedAt,
          id: '1',
        },
        {
          name: 'User',
          sort: 2,
          default: false,
          createdAt: mockRoles[1].createdAt,
          updatedAt: mockRoles[1].updatedAt,
          id: '2',
        },
      ]);
    });
  });

  describe('findById', () => {
    it('should return a role by ID', async () => {
      const mockRole = {
        name: 'Admin',
        sort: 1,
        default: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: '1',
      };
      roleModel.exec.mockResolvedValue(mockRole);

      const result = await service.findById({ id: '1' });
      expect(result).toEqual({
        name: 'Admin',
        sort: 1,
        default: false,
        createdAt: mockRole.createdAt,
        updatedAt: mockRole.updatedAt,
        id: '1',
      });
    });

    it('should throw a NotFound error if role is not found', async () => {
      // Mock the query chain to return null (no role found)
      roleModel.exec.mockResolvedValue(null);

      await expect(
        service.findById({ id: '1' }),
      ).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('maxSort', () => {
    it('should return the max sort value', async () => {
      const mockSort = { sort: 10 };
      roleModel.exec.mockResolvedValue(mockSort);

      const result = await service.maxSort();
      expect(result).toBe(10);
    });

    it('should return 0 if no sort value is found', async () => {
      roleModel.exec.mockResolvedValue(null);
      const result = await service.maxSort();
      expect(result).toBe(0);
    });
  });

  describe('create', () => {
    it('should create a role successfully', async () => {
      const createDto = { name: 'Admin' };
      const mockRole = {
        name: 'Admin',
        sort: 1,
        default: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: '1',
      };

      // Mock maxSort result
      roleModel.exec.mockResolvedValueOnce({ sort: 1 });

      // Mock roleModel.create to return the mockRole object
      roleModel.create.mockResolvedValue(mockRole);

      const result = await service.create(createDto);
      expect(result).toEqual({
        name: 'Admin',
        sort: 1,
        default: false,
        createdAt: mockRole.createdAt,
        updatedAt: mockRole.updatedAt,
        id: '1',
      });

      // Check if the session methods were called correctly
      expect(roleModel.startSession).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should rollback transaction on error', async () => {
      const createDto = { name: 'Admin' };

      // Mock maxSort result
      roleModel.exec.mockResolvedValueOnce({ sort: 1 });

      // Mock roleModel.create to throw an error
      roleModel.create.mockRejectedValue(new Error('Create failed'));

      await expect(service.create(createDto)).rejects.toThrow('Create failed');

      // Check if the session methods were called correctly
      expect(roleModel.startSession).toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update a role successfully', async () => {
      const updateDto = { id: '1', name: 'User' };
      const mockRole = {
        name: 'User',
        sort: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: '1',
      };
      roleModel.exec.mockResolvedValueOnce(mockRole); // Mock findById
      roleModel.exec.mockResolvedValueOnce(mockRole); // Mock findByIdAndUpdate

      const result = await service.update(updateDto);
      expect(result).toEqual({
        name: 'User',
        sort: 1,
        default: undefined,
        createdAt: mockRole.createdAt,
        updatedAt: mockRole.updatedAt,
        id: '1',
      });
    });

    it('should throw an error when trying to update a default role', async () => {
      const updateDto = { id: '1', name: 'User' };
      roleModel.exec.mockResolvedValueOnce({ default: true }); // Mock findById

      await expect(
        service.update(updateDto),
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('should rollback transaction on error during update', async () => {
      const updateDto = { id: '1', name: 'User' };

      // Mock findById to return a non-default role
      roleModel.exec.mockResolvedValueOnce({ default: false });

      // Mock findByIdAndUpdate to throw an error
      roleModel.exec.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        service.update(updateDto),
      ).rejects.toThrowErrorMatchingSnapshot();

      // Check if the session methods were called correctly
      expect(roleModel.startSession).toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled(); // Ensure abortTransaction was called
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete a role successfully', async () => {
      const deleteDto = { id: '1' };
      const mockRole = {
        name: 'User',
        sort: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: '1',
      };
      roleModel.exec.mockResolvedValueOnce(mockRole); // Mock findById
      roleModel.exec.mockResolvedValueOnce(mockRole); // Mock findByIdAndDelete

      const result = await service.delete(deleteDto);
      expect(result).toEqual(mockRole);
      expect(roleModel.updateMany).toHaveBeenCalledWith(
        { sort: { $gt: 2 } },
        { $inc: { sort: -1 } },
        expect.any(Object),
      );
    });

    it('should throw an error when trying to delete a default role', async () => {
      const deleteDto = { id: '1' };
      roleModel.exec.mockResolvedValueOnce({ default: true }); // Mock findById

      await expect(
        service.delete(deleteDto),
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it('should rollback transaction on error during deletion', async () => {
      const deleteDto = { id: '1' };
      roleModel.exec.mockResolvedValueOnce({ default: false }); // Mock findById
      roleModel.exec.mockRejectedValue(new Error('Delete failed')); // Mock findByIdAndDelete failure

      await expect(
        service.delete(deleteDto),
      ).rejects.toThrowErrorMatchingSnapshot();
      // Check if the session methods were called correctly
      expect(roleModel.startSession).toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled(); // Ensure abortTransaction was called
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });

  describe('sort', () => {
    it('should update sort order successfully', async () => {
      const sortDto = { id: '1', sort: 2 };

      const mockRole = {
        _id: '1',
        name: 'Admin',
        sort: 1,
      };

      const updatedRole = {
        _id: '1',
        name: 'Admin',
        sort: 2,
      };

      // Mock maxSort result
      roleModel.exec.mockResolvedValueOnce(3); // Simulating a maxSort of 3

      // Mock findById to return the current role
      roleModel.exec.mockResolvedValueOnce(mockRole);

      // Mock findByIdAndUpdate to return the updated role
      roleModel.exec.mockResolvedValueOnce(updatedRole);

      const result = await service.sort(sortDto);

      expect(result).toEqual(updatedRole);
      expect(roleModel.updateMany).toHaveBeenCalledWith(
        { sort: { $lte: 2, $gt: 1 } }, // Conditions for moving the sort up
        { $inc: { sort: -1 } },
        expect.any(Object),
      );
      expect(roleModel.startSession).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('should rollback transaction on error during sort update', async () => {
      const sortDto = { id: '1', sort: 2 };
      roleModel.exec.mockResolvedValueOnce({ sort: 1 }); // Mock findById
      roleModel.exec.mockRejectedValue(new Error('Sort update failed')); // Mock updateMany or findByIdAndUpdate failure

      await expect(
        service.sort(sortDto),
      ).rejects.toThrowErrorMatchingSnapshot();
      // Check if the session methods were called correctly
      expect(roleModel.startSession).toHaveBeenCalled();
      expect(mockSession.abortTransaction).toHaveBeenCalled(); // Ensure abortTransaction was called
      expect(mockSession.endSession).toHaveBeenCalled();
    });
  });
});
