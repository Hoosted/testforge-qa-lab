import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import type { AuthJwtPayload } from '../auth/auth.service';
import { AuthMessageResponseDto } from '../auth/dto/auth-message-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { SupplierResponseDto } from './dto/supplier-response.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SuppliersService } from './suppliers.service';

@ApiTags('suppliers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'suppliers',
  version: '1',
})
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'List suppliers used by products and admin catalog management' })
  @ApiOkResponse({ type: [SupplierResponseDto] })
  listSuppliers() {
    return this.suppliersService.listSuppliers();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create a supplier' })
  @ApiOkResponse({ type: SupplierResponseDto })
  createSupplier(@Body() body: CreateSupplierDto, @CurrentUser() actor: AuthJwtPayload) {
    return this.suppliersService.createSupplier(body, actor);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a supplier' })
  @ApiOkResponse({ type: SupplierResponseDto })
  updateSupplier(
    @Param('id') supplierId: string,
    @Body() body: UpdateSupplierDto,
    @CurrentUser() actor: AuthJwtPayload,
  ) {
    return this.suppliersService.updateSupplier(supplierId, body, actor);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a supplier' })
  @ApiOkResponse({ type: AuthMessageResponseDto })
  deleteSupplier(@Param('id') supplierId: string, @CurrentUser() actor: AuthJwtPayload) {
    return this.suppliersService.deleteSupplier(supplierId, actor);
  }
}
