import { Any } from '@angular-ru/cdk/typings';
import { isNil } from '@angular-ru/cdk/utils';

declare const require: Any;

export function checkIsNodeEnvironment(): boolean | never {
    if (isNil(require)) {
        throw new Error(`This code can be running only Node.js environments.`);
    }

    return true;
}
