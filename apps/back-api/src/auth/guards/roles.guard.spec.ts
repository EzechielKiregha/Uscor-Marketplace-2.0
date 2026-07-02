import {
    beforeEach,
    describe,
    expect,
    it,
    jest,
} from '@jest/globals'
import { ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RolesGuard } from './roles.guard'

describe('RolesGuard', () => {
  let guard: RolesGuard
  let reflector: Reflector

  beforeEach(() => {
    reflector = new Reflector()
    jest
      .spyOn(reflector, 'getAllAndOverride')
      .mockReturnValue(['business', 'worker'])
    guard = new RolesGuard(reflector)
  })

  it('should allow access when user role matches required role', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'business' },
        }),
      }),
    } as unknown as ExecutionContext

    expect(guard.canActivate(mockContext)).toBe(
      true,
    )
  })

  it('should deny access when user role is unauthorized', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: 'CLIENT' },
        }),
      }),
    } as unknown as ExecutionContext

    expect(guard.canActivate(mockContext)).toBe(
      false,
    )
  })
})
