/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   user.service.spec.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: aptive <aptive@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2023/09/30 19:21:19 by aptive            #+#    #+#             */
/*   Updated: 2023/09/30 20:13:39 by aptive           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// import { Test, TestingModule } from '@nestjs/testing';
// import { UserService } from './User.service';
// import { PrismaService } from '../prisma/prisma.service';
// import { NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
// import { User } from './interfaces/User.interfaces';
// import { CreateUserDto } from './dto/create_User.dto';
// import { AuthCredentialsDto } from './dto/AuthCredentials.dto';
// import { JwtService } from '@nestjs/jwt';
// import { compare } from "bcryptjs";
// import { ConfigService } from '@nestjs/config';



// jest.mock('../prisma/prisma.service', () => ({
// 	PrismaService: jest.fn().mockImplementation(() => ({
// 		user: {
// 			findMany: jest.fn(),
// 		},
// 	})),
// }));

// jest.mock('@nestjs/jwt', () => ({
// 	JwtService: jest.fn().mockImplementation(() => ({})),
// }));

// jest.mock('@nestjs/config', () => ({
// 	ConfigService: jest.fn().mockImplementation(() => ({})),
// }));

// const mockUser: User = {
// 	id: 1,
// 	email: 'test@test.com',
// 	password: 'password', // Cela doit être un mot de passe hashé dans une application réelle
// 	name: 'Test User',
// 	img: 'url_to_image',
// 	status: 'active',
// 	games: 0,
// 	wins: 0,
// 	looses: 0,
// 	rank: 1,
// 	friendList: [],
// 	pendingRequest: [],
// };


// describe('UserService', () => {
// 		let service: UserService;
// 		let prisma: PrismaService;

// 		beforeEach(async () => {
// 			const module: TestingModule = await Test.createTestingModule({
// 				providers: [UserService, PrismaService, JwtService, ConfigService],
// 			}).compile();

// 			service = module.get<UserService>(UserService);
// 			prisma = module.get<PrismaService>(PrismaService);

// 			(prisma.user.findMany as jest.Mock).mockResolvedValue([]);
// 			(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser); // pour mocker prisma
// 			(service.findByEmail as jest.Mock).mockResolvedValue(mockUser); // pour mocker une méthode du service
// 		});

// 		it('should be defined', () => {
// 			expect(service).toBeDefined();
// 		});
// // +--------------------------------------------------------------------------------+
// // |                                     findAll                                    |
// // +--------------------------------------------------------------------------------+

// 		describe('findAll', () => {
// 			it('should return an array of users', async () => {
// 				const result = [{ name: 'Test User' }];
// 				(prisma.user.findMany as jest.Mock).mockResolvedValue(result);
// 				expect(await service.findAll()).toBe(result);
// 		});

// // +--------------------------------------------------------------------------------+
// // |                                     create                                    |
// // +--------------------------------------------------------------------------------+

// 		// describe('create', () => {
// 		// 	it('should create a user successfully', async () => {
// 		// 	const createUserDto: CreateUserDto = {
// 		// 		email: '',
// 		// 		password: ''
// 		// 	};

// 		// 	const createdUser: User = {
// 		// 		// Initialize with expected result
// 		// 	};

// 		// 	(prisma.user.create as jest.Mock).mockResolvedValue(createdUser);

// 		// 	expect(await service.create(createUserDto)).toBe(createdUser);
// 		// 	});
// 		// });

// // +--------------------------------------------------------------------------------+
// // |                                    findById                                    |
// // +--------------------------------------------------------------------------------+
// 		describe('findById', () => {
// 			it('should return a user if it exists', async () => {
// 			const userId = 1;
// 			const user: User = {
// 				id: 1,
// 				email: 'test@test.com',
// 				password: 'password', // Cela doit être un mot de passe hashé dans une application réelle
// 				name: 'Test User',
// 				img: 'url_to_image',
// 				status: 'active',
// 				games: 0,
// 				wins: 0,
// 				looses: 0,
// 				rank: 1,
// 				friendList: [],
// 				pendingRequest: [],
// 			};

// 			(prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

// 			expect(await service.findById(userId)).toBe(user);
// 			});

// 			it('should throw an error if user does not exist', async () => {
// 			const userId = 2;

// 			(prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

// 			await expect(service.findById(userId)).rejects.toThrow(NotFoundException);
// 			});
// 		});

// // +--------------------------------------------------------------------------------+
// // |                                  findByName                                    |
// // +--------------------------------------------------------------------------------+
// 		describe('findByName', () => {
// 			it('should return users if they exist', async () => {
// 			const name = 'testName';
// 			const users: User[] = [
// 				{
// 					id: 1,
// 					email: 'test@test.com',
// 					password: 'password', // Cela doit être un mot de passe hashé dans une application réelle
// 					name: 'Test User',
// 					img: 'url_to_image',
// 					status: 'active',
// 					games: 0,
// 					wins: 0,
// 					looses: 0,
// 					rank: 1,
// 					friendList: [],
// 					pendingRequest: [],
// 				}
// 			];

// 			(prisma.user.findMany as jest.Mock).mockResolvedValue(users);

// 			expect(await service.findByName(name)).toBe(users);
// 			});

// 			it('should throw an error if no user found', async () => {
// 			const name = 'nonexistent';

// 			(prisma.user.findMany as jest.Mock).mockResolvedValue([]);

// 			await expect(service.findByName(name)).rejects.toThrow(NotFoundException);
// 			});
// 		});

// // +--------------------------------------------------------------------------------+
// // |                                  signIn                                    |
// // +--------------------------------------------------------------------------------+
// 		describe('signIn', () => {
// 			it('should return token if credentials are valid', async () => {
// 			const authCredentialsDto: AuthCredentialsDto = {
// 				email: 'test@test.com',
// 				password: 'password',
// 			};

// 			const user: User = {
// 				id: 1,
// 				email: 'test@test.com',
// 				password: 'password', // Cela doit être un mot de passe hashé dans une application réelle
// 				name: 'Test User',
// 				img: 'url_to_image',
// 				status: 'active',
// 				games: 0,
// 				wins: 0,
// 				looses: 0,
// 				rank: 1,
// 				friendList: [],
// 				pendingRequest: [],
// 			};

// 			const token = 'validToken';

// 			(service.findByEmail as jest.Mock).mockResolvedValue(user);
// 			(compare as jest.Mock).mockResolvedValue(true); // Assuming valid password
// 			(service.createAuthenticationToken as jest.Mock).mockReturnValue(token);

// 			expect(await service.signIn(authCredentialsDto)).toEqual({ token });
// 			});

// 			it('should throw UnauthorizedException if credentials are invalid', async () => {
// 			const authCredentialsDto: AuthCredentialsDto = {
// 				email: 'test@test.com',
// 				password: 'password',
// 			};

// 			(service.findByEmail as jest.Mock).mockRejectedValue(new UnauthorizedException('invalid credentials'));

// 			await expect(service.signIn(authCredentialsDto)).rejects.toThrow(UnauthorizedException);
// 			});
// 		});
// 	});
// });
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './User.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { User } from './interfaces/User.interfaces';
import { CreateUserDto } from './dto/create_User.dto';
import { AuthCredentialsDto } from './dto/AuthCredentials.dto';
import { JwtService } from '@nestjs/jwt';
import { compare } from "bcryptjs";
import { ConfigService } from '@nestjs/config';

jest.mock('../prisma/prisma.service', () => ({
    PrismaService: jest.fn().mockImplementation(() => ({
        user: {
            findMany: jest.fn(),
            findUnique: jest.fn(), // Ajouté findUnique ici
        },
    })),
}));

jest.mock('@nestjs/jwt', () => ({
    JwtService: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@nestjs/config', () => ({
    ConfigService: jest.fn().mockImplementation(() => ({})),
}));

const mockUser: User = {
    id: 1,
    email: 'test@test.com',
    password: 'password',
    name: 'Test User',
    img: 'url_to_image',
    status: 'active',
    games: 0,
    wins: 0,
    looses: 0,
    rank: 1,
    friendList: [],
    pendingRequest: [],
};

describe('UserService', () => {
    let service: UserService;
    let prisma: PrismaService;

    // Créer un mock de la méthode findByEmail
    const findByEmailMock = jest.fn();

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                { provide: UserService, useValue: { findByEmail: findByEmailMock } }, // Utiliser le mock ici
                PrismaService,
                JwtService,
                ConfigService
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        prisma = module.get<PrismaService>(PrismaService);

        // Configurer les mocks
        (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        findByEmailMock.mockResolvedValue(mockUser); // Utiliser le mock ici
    });


    describe('findById', () => {
        it('should return a user if it exists', async () => {
            const userId = 1;
            const user: User = mockUser;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
            expect(await service.findById(userId)).toBe(user);
        });

        it('should throw an error if user does not exist', async () => {
            const userId = 2;
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(service.findById(userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByName', () => {
        it('should return users if they exist', async () => {
            const name = 'testName';
            const users: User[] = [mockUser];
            (prisma.user.findMany as jest.Mock).mockResolvedValue(users);
            expect(await service.findByName(name)).toBe(users);
        });

        it('should throw an error if no user found', async () => {
            const name = 'nonexistent';
            (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
            await expect(service.findByName(name)).rejects.toThrow(NotFoundException);
        });
    });

    describe('signIn', () => {
        it('should return token if credentials are valid', async () => {
            const authCredentialsDto: AuthCredentialsDto = {
                email: 'test@test.com',
                password: 'password',
            };
            const user: User = mockUser;
            const token = 'validToken';

            (service.findByEmail as jest.Mock).mockResolvedValue(user);
            (compare as jest.Mock).mockResolvedValue(true);
            (service.createAuthenticationToken as jest.Mock).mockReturnValue(token);

            expect(await service.signIn(authCredentialsDto)).toEqual({ token });
        });

        it('should throw UnauthorizedException if credentials are invalid', async () => {
            const authCredentialsDto: AuthCredentialsDto = {
                email: 'test@test.com',
                password: 'password',
            };
            (service.findByEmail as jest.Mock).mockRejectedValue(new UnauthorizedException('invalid credentials'));
            await expect(service.signIn(authCredentialsDto)).rejects.toThrow(UnauthorizedException);
        });
    });
});
