import { isDevMode } from '@angular/core';
import { deepFreeze } from '@angular-ru/cdk/object';
import { Any } from '@angular-ru/cdk/typings';
import { isNil, isNotNil } from '@angular-ru/cdk/utils';
import { NGXS_DATA_EXCEPTIONS } from '@angular-ru/ngxs/tokens';
import { DataStateClass, NgxsRepositoryMeta } from '@angular-ru/ngxs/typings';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { NgxsDataInjector } from '../../services/ngxs-data-injector.service';
import { getRepository } from '../repository/get-repository';

// eslint-disable-next-line max-lines-per-function,sonarjs/cognitive-complexity
export function createStateSelector(stateClass: DataStateClass): void {
    const repository: NgxsRepositoryMeta = getRepository(stateClass);
    const name: string | undefined | null = repository?.stateMeta?.name ?? null;

    if (isNotNil(name)) {
        const selectorId: string = `__${name}__selector`;

        Object.defineProperties(stateClass.prototype, {
            [selectorId]: { writable: true, enumerable: false, configurable: true },
            state$: {
                enumerable: true,
                configurable: true,
                get(): Observable<Any> {
                    if (isNotNil(this[selectorId])) {
                        return this[selectorId];
                    } else {
                        if (isNil(NgxsDataInjector.store)) {
                            throw new Error(NGXS_DATA_EXCEPTIONS.NGXS_DATA_MODULE_EXCEPTION);
                        }

                        this[selectorId] = NgxsDataInjector.store.select(stateClass as Any).pipe(
                            map((state: Any): Any => (isDevMode() ? deepFreeze(state) : state)),
                            shareReplay({ refCount: true, bufferSize: 1 })
                        );
                    }

                    return this[selectorId];
                }
            }
        });
    }
}
