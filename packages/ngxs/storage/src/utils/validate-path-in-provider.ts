import { NgxsRepositoryMeta, PersistenceProvider } from '@angular-ru/ngxs/typings';

export function validatePathInProvider(meta: NgxsRepositoryMeta, provider: PersistenceProvider): PersistenceProvider {
    let newProvider: PersistenceProvider = provider;

    if (!('path' in newProvider)) {
        newProvider = {
            ...newProvider,
            get path(): string | null | undefined {
                return meta?.stateMeta?.path;
            }
        };
    }

    return newProvider;
}
