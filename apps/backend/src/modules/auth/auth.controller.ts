import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import type { AppEnvironment } from '../../config/app.environment';
import { ApiErrorResponseDto } from '../../common/dto/api-error-response.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { AuthService, type AuthJwtPayload } from './auth.service';
import { AuthMessageResponseDto } from './dto/auth-message-response.dto';
import { AuthSessionResponseDto } from './dto/auth-session-response.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { LoginDto } from './dto/login.dto';

interface HttpRequestLike {
  cookies?: Record<string, unknown>;
}

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate a user with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) response: Response) {
    const user = await this.authService.validateUserCredentials(body.email, body.password);
    const session = await this.authService.createSession(user);

    this.setRefreshCookie(response, session.refreshToken);

    return {
      accessToken: session.accessToken,
      user: this.authService.buildAuthUser(user),
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh the current authenticated session' })
  @ApiOkResponse({ type: AuthSessionResponseDto })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async refresh(@Res({ passthrough: true }) response: Response) {
    const refreshToken = this.getRefreshTokenFromCookies(this.getResponseCookies(response));

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const nextSession = await this.authService.rotateRefreshSession(refreshToken);

    this.setRefreshCookie(response, nextSession.refreshToken);

    return {
      accessToken: nextSession.accessToken,
      user: nextSession.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Invalidate the current authenticated session' })
  @ApiOkResponse({ type: AuthMessageResponseDto })
  async logout(@Res({ passthrough: true }) response: Response) {
    const refreshToken = this.getRefreshTokenFromCookies(this.getResponseCookies(response));

    if (refreshToken) {
      await this.authService.revokeRefreshSession(refreshToken);
    }

    this.clearRefreshCookie(response);

    return {
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Return the current authenticated user' })
  @ApiOkResponse({ type: AuthUserDto, description: 'The current user payload.' })
  @ApiUnauthorizedResponse({ type: ApiErrorResponseDto })
  async me(@CurrentUser() user: AuthJwtPayload) {
    return this.authService.getAuthenticatedUser(user.sub);
  }

  @Get('operator/access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OPERATOR')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Protected route available to operators and admins' })
  @ApiOkResponse({ type: AuthMessageResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  operatorAccess(@CurrentUser() user: AuthJwtPayload) {
    return {
      message: `Operator area available for ${user.email}`,
    };
  }
  @Get('admin/access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Protected route available only to admins' })
  @ApiOkResponse({ type: AuthMessageResponseDto })
  @ApiForbiddenResponse({ type: ApiErrorResponseDto })
  adminAccess(@CurrentUser() user: AuthJwtPayload) {
    return {
      message: `Admin area available for ${user.email}`,
    };
  }

  private setRefreshCookie(response: Response, refreshToken: string) {
    const appConfig = this.configService.getOrThrow<AppEnvironment>('app');

    response.cookie(appConfig.auth.cookieName, refreshToken, {
      httpOnly: true,
      secure: appConfig.auth.secureCookies,
      sameSite: 'lax',
      domain: appConfig.auth.cookieDomain,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(response: Response) {
    const appConfig = this.configService.getOrThrow<AppEnvironment>('app');

    response.clearCookie(appConfig.auth.cookieName, {
      httpOnly: true,
      secure: appConfig.auth.secureCookies,
      sameSite: 'lax',
      domain: appConfig.auth.cookieDomain,
      path: '/',
    });
  }

  private getRefreshTokenFromCookies(cookies: Record<string, unknown> | undefined) {
    const appConfig = this.configService.getOrThrow<AppEnvironment>('app');
    const cookieValue = cookies?.[appConfig.auth.cookieName];

    return typeof cookieValue === 'string' ? cookieValue : null;
  }

  private getResponseCookies(response: Response) {
    const request = response.req as HttpRequestLike | undefined;

    return request?.cookies;
  }
}
