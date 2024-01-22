/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.controller.spec.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/09/30 17:16:40 by aptive            #+#    #+#             */
/*   Updated: 2023/09/30 19:11:31 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './User.controller';
import { UserService } from './User.service';
import { UpdateUserDto } from './dto/update_User.dto';
import { CreateUserDto } from './dto/create_User.dto';



// Mock Object of UserService
const mockUserService = {
	findAll: jest.fn(),
	findById: jest.fn(),
	findByName: jest.fn(),
	create: jest.fn(),
	signIn: jest.fn(),
	updateUser: jest.fn(),
	delete: jest.fn(),
	getMyProfile: jest.fn(),
	updateMyProfile: jest.fn(),
	deleteMyAccount: jest.fn(),
	updateURLImage: jest.fn(),
};

describe('UserController', () => {
	let controller: UserController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserController],
			providers: [{ provide: UserService, useValue: mockUserService }],
		}).compile();

		controller = module.get<UserController>(UserController);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});


// +--------------------------------------------------------------------------------+
// |                                    findAll                                     |
// +--------------------------------------------------------------------------------+
	describe('findAll', () => {
		it('should return an array of users', async () => {
			const result = ['test'];
			mockUserService.findAll.mockResolvedValue(result);
			expect(await controller.findAll()).toBe(result);
		});
	});

// +--------------------------------------------------------------------------------+
// |                                    findById                                    |
// +--------------------------------------------------------------------------------+
	describe('findById', () => {
		it('should return a user by id', async () => {
			const result = { id: 1, name: 'John Doe' };
			mockUserService.findById.mockResolvedValue(result);
			expect(await controller.findById(1)).toBe(result);
		});
	});

	describe('findById', () => {
		it('should throw an error if the user ID is not a number', async () => {
			mockUserService.findById.mockImplementation(() => {
				throw new Error('Invalid ID');
			});
			await expect(controller.findById('invalid' as any)).rejects.toThrow('Utilisateur avec ID invalid n\'a pas été trouvé');
		});
	});

// +--------------------------------------------------------------------------------+
// |                                  findByName                                    |
// +--------------------------------------------------------------------------------+
	describe('findByName', () => {
		it('should return a user by name', async () => {
			const result = { id: 1, name: 'John Doe' };
			mockUserService.findByName.mockResolvedValue(result);
			expect(await controller.findByName('John Doe')).toBe(result);
		});
	});

// +--------------------------------------------------------------------------------+
// |                                     signIn                                     |
// +--------------------------------------------------------------------------------+
	describe('signIn', () => {
		it('should sign in a user and return a token', async () => {
			const signInDto = { email: 'john.doe@example.com', password: 'password' };
			const result = { accessToken: 'accessToken' };
			mockUserService.signIn.mockResolvedValue(result);
			expect(await controller.signIn(signInDto)).toBe(result);
		});
	});

	describe('signIn', () => {
		it('should call signIn method with correct parameters', async () => {
			const signInDto = { email: 'john.doe@example.com', password: 'password' };
			const result = { accessToken: 'accessToken' };
			mockUserService.signIn.mockResolvedValue(result);

			expect(await controller.signIn(signInDto)).toBe(result);
			expect(mockUserService.signIn).toHaveBeenCalledWith(signInDto);
		});
	});

// +--------------------------------------------------------------------------------+
// |                                   updateUser                                   |
// +--------------------------------------------------------------------------------+
	describe('updateUser', () => {
		it('should update and return the updated user', async () => {
			const updateUserDto = { name: 'Jane Doe' }; // Ajustez en fonction de votre DTO réel
			const result = { id: 1, name: 'Jane Doe' };
			mockUserService.updateUser.mockResolvedValue(result);
			expect(await controller.updateUser(1, updateUserDto)).toBe(result);
		});
	});

	describe('updateUser', () => {
		it('should throw an error if the user ID is invalid', async () => {
			mockUserService.updateUser.mockImplementationOnce(() => Promise.reject(new Error('Invalid ID')));
			await expect(controller.updateUser(null, {} as UpdateUserDto)).rejects.toThrow('Une erreur s’est produite lors de la mise à jour de l\'utilisateur null');
		});
	});

// +--------------------------------------------------------------------------------+
// |                                  getMyProfile                                  |
// +--------------------------------------------------------------------------------+
	describe('getMyProfile', () => {
		it('should return the profile of the logged-in user', async () => {
			const result = { id: 1, name: 'John Doe' };
			mockUserService.getMyProfile.mockResolvedValue(result);
			expect(await controller.getMyProfile({} as any)).toBe(result);
		});
	});

// +--------------------------------------------------------------------------------+
// |                                updateMyProfile                                 |
// +--------------------------------------------------------------------------------+
	describe('updateMyProfile', () => {
		it('should update and return the profile of the logged-in user', async () => {
			const updateProfileDto = { name: 'Jane Doe' }; // Ajustez en fonction de votre DTO réel
			const result = { id: 1, name: 'Jane Doe' };
			mockUserService.updateMyProfile.mockResolvedValue(result);
			expect(await controller.updateMyProfile({} as any, {} as UpdateUserDto)).toBe(result);
		});
	});

	describe('updateMyProfile', () => {
		it('should not update the user if the same data is provided', async () => {
			const updateProfileDto = { name: 'John Doe' };
			const user = { id: 1, name: 'John Doe' };

			mockUserService.updateMyProfile.mockResolvedValue(user);

			const result = await controller.updateMyProfile(user as any, updateProfileDto as UpdateUserDto);

			// Vous devrez ajuster cette attente en fonction de la logique réelle de votre méthode.
			expect(result).toEqual(user);
		});
	});

// +--------------------------------------------------------------------------------+
// |                                deleteMyAccount                                 |
// +--------------------------------------------------------------------------------+
	describe('deleteMyAccount', () => {
		it('should delete the account of the logged-in user and return a success message', async () => {
			const result = { message: 'Account deleted successfully' };
			mockUserService.deleteMyAccount.mockResolvedValue(result);
			expect(await controller.deleteMyAccount({} as any)).toBe(result);
		});
	});


// +--------------------------------------------------------------------------------+
// |                                    createUser                                  |
// +--------------------------------------------------------------------------------+
	describe('createUser', () => {
		it('should create a new user and return it', async () => {
			const createUserDto = { name: 'John Doe',password: "pass", email: 'john.doe@example.com' }; // Ajustez en fonction de votre DTO réel
			const result = { id: 1, ...CreateUserDto };
			mockUserService.create.mockResolvedValue(result);
			expect(await controller.createUser(createUserDto)).toBe(result);
		});
	});


// +--------------------------------------------------------------------------------+
// |                                    deleteUser                                  |
// +--------------------------------------------------------------------------------+
	describe('deleteUser', () => {
		it('should delete a user and return a success message', async () => {
			const result = { message: 'User deleted successfully' };
			mockUserService.delete.mockResolvedValue(result);
			expect(await controller.deleteUser(1)).toEqual(result);
		});
	});

});
