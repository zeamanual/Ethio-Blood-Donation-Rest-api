import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private reflector:Reflector){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        let roleSpecified = this.reflector.get('role',context.getHandler())
        let request = context.switchToHttp().getRequest()
        if(!roleSpecified){
            return true
        }
        if(request.user['role'].includes(roleSpecified)){
            return true
        }else{
            return false
        }
    }
}