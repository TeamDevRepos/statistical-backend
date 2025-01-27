import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../validRole';

export const META_ROLES = 'roles';

export const RoleProtected = (...args: ValidRoles[]) => {

    return SetMetadata(META_ROLES, args);
}
