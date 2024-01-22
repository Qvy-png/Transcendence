import { Controller, Get, Post, Req, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('2fa')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('enable-2fa')

  async enableTwoFactor(@Req() req: any): Promise<{ qrCodeURL: string, secret: string }> {
    console.error('2FA token enable called ____________________________________________________________________');

    const user = req.user;
    const secret = await this.authService.generateTwoFactorSecret(user.id);
    const qrCodeURL = await this.authService.generateQRCodeURL(user.email, secret);
  
    // Save the user's secret key in the database.
    await this.authService.saveTwoFactorSecret(user.id, secret);
  
    // Inform the user that they should keep this secret safe and secure.
    return { qrCodeURL, secret };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('verify-2fa')
  async verifyTwoFactorAuthentication(@Req() req: any, @Body('token') token: string): Promise<{ message: string }> {
    console.error('2FA token verification called ____________________________________________________________________');

    const isTokenValid = await this.authService.validateTwoFactorToken(req.user.id, token);
    
    if (isTokenValid) {
      // You might want to update the user's status here if needed.
	  console.error('2FA valid');
      return { message: '2FA token verification is valid' };
    } else {
      // It's better to throw a predefined exception with a status code here.
	  console.error('2FA token verfification is not valid');
      throw new Error('Invalid 2FA token');
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('disable-2fa')
  async disableTwoFactor(@Req() req: any, @Body('token') token: string): Promise<{ message: string }> {
    const user = req.user;
    console.error('2FA token disable called ____________________________________________________________________');
    // Ensure that the user provides a valid 2FA token before disabling 2FA.
    const isTokenValid = await this.authService.validateTwoFactorToken(user.id, token);
    if (!isTokenValid) {
      // As with the verify endpoint, it's better to throw a predefined exception with a status code.
	  console.error('2FA token verfification for disabling is not valid');
      throw new Error('Invalid 2FA token');
    }
    
    await this.authService.removeTwoFactorSecret(user.id);
    return { message: '2FA successfully disabled' };
  }
}
